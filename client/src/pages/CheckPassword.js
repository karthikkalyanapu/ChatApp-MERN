import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PiUserCircle } from "react-icons/pi";
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPassword = () => {

  const [data, setData] = useState({
    password: "",
    userId : ""
  })
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
      if(!location?.state?.name) {
        navigate('/email')
      }
  }, []);

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

  const handleSubmit = async (e) =>{

    e.preventDefault();
    e.stopPropagation();

    const url = 'http://localhost:8000/api/password'

    // REACT_APP_BACKEND_URL
    try {
    //  const response = await axios.post(url,data)

    const response = await axios({
      method :'post',
      url : url,
      data : {
        userId : location?.state?._id,
        password : data.password
      },
      withCredentials : true
    })
     toast.success(response.data.message)

      if(response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token', response?.data?.token )
        setData({
          password: "",
        })
        navigate('/')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }   
  }   

  return (
    <div className='mt-5'>
    <div className='bg-white wfull  max-w-md rounded overflow-hidden p-4 mx-auto'>
      <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
        {/* <PiUserCircle size= {80} /> */}
        <Avatar
         name={location?.state?.name} 
         imageUrl={location?.state?.profile_pic}
         width={80} 
         height={80}/>
         <h2 className='font-semibold text-lg mt-1'>
          {location.state?.name}
         </h2>
      </div>
      <h3>Welcome to Chat app</h3>
      <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-1'>
          <label htmlFor='password'>Password: </label>
          <input
            type='password'
            id='password' 
            name='password' 
            placeholder='enter your password'
            className='bg-slate-100 px-2 py-1 focus:outline-primary'
            value={data?.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type='submit' className='bg-primary px-2 py-1 hover:bg-secondary rounded mt-2 font-bold text-white  leading-relaxed tracking-wide'>Login</button>
      </form>

      <p className='my-4 text-center'><Link to={"/forgot-password"} className='hover:text-primary font-semibold'>Forgot Password ?</Link></p>
    </div>

  </div>
  )
}

export default CheckPassword