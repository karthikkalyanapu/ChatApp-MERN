async function logout(req, res) {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: true, // set to true if you're serving over HTTPS
            sameSite: 'None',
        }

        return res.cookie('token','', cookieOptions).status(200).json({
            message : "session out",
            success : true
        })
    } catch(error) {
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

module.exports = logout;