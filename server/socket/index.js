const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { disconnect } = require('process');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConverstationModel');
const getConversation = require('../helpers/getConversation');

const app = express()

// socket connection
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*', //Allow requests from any origin
        credentials: true
    }
})

// Handle preflight requests for all routes


const onlineUser = new Set();

io.on('connection', async (socket) => {
    const token = socket.handshake.auth.token

    // current user details
    const user = await getUserDetailsFromToken(token)

    //create a room
    socket.join(user?._id?.toString())
    onlineUser.add(user?._id?.toString())
    io.emit('onlineUser', Array.from(onlineUser))

    socket.on('message-page', async (userId) => {
        const userDetails = await UserModel.findById(userId).select("-password")

        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails.profile_pic,
            online: onlineUser.has(userId)
        }

        socket.emit('message-user', payload)

        // get previous mess

        const getConversation = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id }
            ]
        }).populate('messages').sort({ updatedAt: -1 })
        // console.log("getConversation", getConversation);
        // io.to(data?.sender).emit('message', getConversation.messages)
        // io.to(data?.receiver).emit('message', getConversation.messages)
        socket.emit('message', getConversation?.messages || [])

    })

    // new message

    socket.on('new message', async (data) => {

        // check conversation is available of both users

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        })

        if (!conversation) {
            const createConversataion = await ConversationModel({
                sender: data?.sender,
                receiver: data?.receiver
            })
            conversation = await createConversataion.save()
        }

        const message = new MessageModel({
            text: data?.text,
            imageUrl: data?.imageUrl,
            videoUrl: data?.videoUrl,
            msgByUserId: data?.msgByUserId
        })

        const saveMessage = await message.save();

        const updateConversation = await ConversationModel.updateOne({ _id: conversation?._id }, {
            "$push": { messages: saveMessage?._id }
        })

        const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        }).populate('messages').sort({ updatedAt : -1 })

        io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

        //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation',conversationSender)
        io.to(data?.receiver).emit('conversation',conversationReceiver)
    })

    socket.on('sidebar', async(currentUserId)=> {
        console.log("currentUserId", currentUserId);

        if(currentUserId) {
            const currentUserConversation = await ConversationModel.find({
                "$or" : [
                    { sender : currentUserId },
                    { receiver : currentUserId }
                ]
            }).sort({ updatedAt : -1 }).populate('messages').populate('sender').populate('receiver')
    
            const conversation = currentUserConversation.map((conv)=> {
                console.log("convconv", conv);
    
                    const countUnseenMsg = conv.messages.reduce((prev, curr) => prev + (curr.seen ? 0 : 1 ), 0 )
                    return {
                        _id : conv?._id,
                        sender : conv?.sender,
                        receiver : conv?.receiver,
                        unseenMsg : countUnseenMsg,
                        lastMsg : conv?.messages[conv?.messages?.length - 1]
                    }
                })
    
                console.log("conversation", conversation);
    
            socket.emit("conversation",conversation )
        }
    })

    socket.on('seen',async(msgByUserId)=>{
        
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : msgByUserId },
                { sender : msgByUserId, receiver :  user?._id}
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages  = await MessageModel.updateMany(
            { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
            { "$set" : { seen : true }}
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })

    socket.on('disconnect', () => {
        onlineUser.delete(user?._id?.toString())
        console.log("disconnected user", socket.id)
    })
})

module.exports = {
    app,
    server
}

