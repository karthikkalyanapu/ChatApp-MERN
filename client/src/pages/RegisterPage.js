import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5'
import uploadFile from '../helpers/uploadFiles';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  })

const [uploadPhoto, setUploadPhoto] = useState("");
const navigate = useNavigate();

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value} = e.target;
    
    setData((prevValue) => {
    return {
      ...prevValue,
      [name] : value
     }
    })
  }

  const handleUploadPhoto = async(e) => {
    const file = e.target.files[0];

    const uploadPhoto = await uploadFile(file)
    setUploadPhoto(file);

    setData((prevValue) => {
    return {
      ...prevValue,
      profile_pic : uploadPhoto?.url
     }
    })
  }

  const handleClearUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadPhoto(null)
  }

  const handleSubmit = async (e) =>{

    e.preventDefault();
    e.stopPropagation();
    // console.log(":process.env.REACT_BACKEND_URL", process.env.REACT_BACKEND_URL);
    const url = 'http://localhost:8000/api/register'
    try {
     const response = await axios.post(url,data)
     toast.success(response.data.message)
      if(response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: ""
        })
        navigate('/email')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }   
  }   
  
   return (
    <div className='mt-5'>
      <div className='bg-white wfull  max-w-md rounded overflow-hidden p-4 mx-auto'>
        <h3>Welcome to Chat app</h3>
        <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>Name: </label>
            <input
              type='text'
              id='name' 
              name='name' 
              placeholder='enter your name'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>Email: </label>
            <input
              type='email'
              id='email' 
              name='email' 
              placeholder='enter your email'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password: </label>
            <input
              type='password'
              id='password' 
              name='password' 
              placeholder='enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='profile_pic'>Photo:
              <div className='h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer' >
              <p className='text-sm max-w-[300px] text-ellipis line line-cramp-1' >
                {uploadPhoto?.name  ? uploadPhoto?.name : 'Upload profile photo' }</p>
                {
                  uploadPhoto?.name &&  (
                    <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                      < IoClose/>
                    </button>
                  )
                }
              </div>
             </label>
            <input
              type='file'
              id='profile_pic' 
              name='profile_pic' 
              className='bg-slate-100 px-2 py-1 focus:outline-primary hidden'
              onChange={handleUploadPhoto}
            />
          </div>

          <button type='submit' className='bg-primary px-2 py-1 hover:bg-secondary rounded mt-2 font-bold text-white  leading-relaxed tracking-wide'>Register</button>
        </form>

        <p className='my-4 text-center'>Already have account ? <Link to={"/email"} className='hover:text-primary font-semibold'>Login</Link></p>
      </div>

    </div>
  )
}

export default RegisterPage