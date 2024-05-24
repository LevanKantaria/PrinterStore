import React from 'react'
import { useState } from "react";
import { TextField } from '@mui/material';
import axios from 'axios'
import classes from './UploadItem.module.css'
import CustomButton from '../customButton/CustomButton';
import DragAndDrop from '../dragAndDrop/DragAndDrop';


// const API_URL ='https://factory-l.herokuapp.com/'
const API_URL ='http://localhost:5000/'

const UploadItem = () => {

    
    const [item,setItem] = useState({
        name:'',
        category:'',
        images:[],
        price:'',
        creator:'levani',
        subCategory:'',
        description:'',
    })
    
    const submitHandler = (e)=>{
        e.preventDefault();
        console.log(item)
        axios.post(API_URL + "api/products", item).then(res=>{
            console.log(res)
            setItem({
                name:'',
            category:'',
            images:'123456',
            price:'',
            creator:'levani',
            subCategory:''
            })
        })
        
    }
    

  return (
    <div className={classes.wrapper}>
    
    <h2>UploadItem</h2>

    <form className={classes.uploadForm}>

    <TextField margin="dense" id='name' label='name' onChange={(e)=>{setItem({...item, name:e.target.value})}}/>
    <TextField margin="dense" id='category'label='category'onChange={(e)=>{setItem({...item, category:e.target.value})}}/>
    
    <TextField margin="dense" id='subCategory'label='subCategory'onChange={(e)=>{setItem({...item, subCategory:e.target.value})}}/>
    <TextField margin="dense" id='price' label='price' onChange={(e)=>{setItem({...item, price:e.target.value})}} />
    <TextField margin="dense" id='description'label='description'onChange={(e)=>{setItem({...item, description:e.target.value})}}/>
    <DragAndDrop
        onChange={(images, hasFiles) => setItem({ ...item, images })}
        text="Choose images or drag them here:"
      />

    <CustomButton
    onClick={submitHandler} 
    text='submit'
    />
    </form>

    </div>
  )
}

export default UploadItem