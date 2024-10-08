import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure
} from '../redux/user/userSlice.js'

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file)
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred /
          snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then
          ((downloadURL) =>
            setFormData({ ...formData, avatar: downloadURL })
          );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className="text-3xl text-center font-semibold my-7">Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input
          type='file'
          ref={fileRef} hidden accept='image/*'
          onChange={(e) => setFile(e.target.files[0])}
        />

        <img
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full object-cover 
        h-24 w-24 
        hover:cursor-pointer 
        self-center mt-2'
          onClick={() => fileRef.current.click()} />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>Error image upload(imgage mest be less than 2 mb)</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc} %`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image Uploaded Successfully</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          placeholder='username'
          className='p-3 rounded-lg border'
          id='username'
          defaultValue={currentUser.username}
          onChange={handleChange} />
        <input
          type='email'
          placeholder='email'
          className='p-3 rounded-lg border'
          id='email'
          defaultValue={currentUser.email}
          onChange={handleChange} />
        <input
          type='password'
          placeholder='password'
          className='p-3 rounded-lg border'
          id='password'
          onChange={handleChange} />
        <button disabled={loading}
          className='p-3 bg-slate-700 hover:opacity-95 disabled:opacity-80 text-white uppercase rounded-lg'>
          {loading ? 'Loading...' : 'update '}
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User is updated successfully!!' : ''}</p>
    </div>
  )
}
