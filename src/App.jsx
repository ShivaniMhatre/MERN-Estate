import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import About from './pages/About'

export default function  App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path='/' element={<Home/>}/>
      <Route exact path='/sign-in' element={<Signin/>}/>
      <Route exact path='/sign-up' element={<Signup/>}/>
      <Route exact path='/profile' element={<Profile/>}/>
      <Route exact path='/about' element={<About/>}/>
    </Routes>
    </BrowserRouter>
  )
}
