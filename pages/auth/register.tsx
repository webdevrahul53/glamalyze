/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/router';
import React from 'react'
import { useForm } from 'react-hook-form';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = React.useState('')
  const router = useRouter();


  const onSubmit = async (data:any) => {
    console.log(data);
    
    try {
        const user = await fetch('/api/users/register', {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        const parsedUser = await user.json();
        if(parsedUser.status){
            router.push('/auth/login')
        }else setError(parsedUser.message)
    }catch(err:any) {
        setError(err)
    }
}



  return (
    <form className="w-1/3 m-auto my-6 p-3" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-6xl mb-3">Register</h1>
        
        <Input className="my-4" {...register("name", {required: true})} label="Name" placeholder="Enter your name" type="text" variant="flat" />
        <Input className="my-4" {...register("email", {required: true})} label="Email" placeholder="Enter your email" type="text" variant="bordered" />
        <Input className="my-4" {...register("password", {required: true})} label="Password" placeholder="Enter your password" type="password" variant="bordered" />

        <div className="pb-2 text-red-700">
            {errors && <div>{error}</div>}
            {errors.name && <div>Name is required</div>}
            {errors.email && <div>Email is required</div>}
            {errors.password && <div>Password is required</div>}
        </div>
        <Button type="submit" color="primary">Submit</Button>
        <Link href={"/auth/login"}> <Button className="ms-3" variant="bordered" color="primary">Sign In</Button> </Link>
    </form>
  )
}
