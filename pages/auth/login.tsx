/* eslint-disable @typescript-eslint/no-explicit-any */
import { setUser } from '@/core/redux/userSlice/userSlice';
import { Button, Input } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/router';
import React from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export default function Login() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = React.useState(null)
    const [isLoading, setLoading] = React.useState(false)



    const onSubmit = async (data:any) => {
        setLoading(true)
        try {
            const user = await fetch("/api/users/login", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            })
            const parsedUser = await user.json();
            console.log(parsedUser);
            
            setLoading(false)
            if(parsedUser.status){
                dispatch(setUser(parsedUser.data))
                setError(null)
                router.push("/")
            }else setError(parsedUser.message)
        }catch(err:any) {
            setLoading(false)
            setError(err)
        }
    }


    return (
        <form className="w-1/3 m-auto my-6 p-3" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-6xl mb-3">Sign In</h1>
            
            <Input className="my-4" {...register("email", {required: true})} label="Email" placeholder="Enter your email" type="text" variant="flat" />
            <Input className="my-4" {...register("password", {required: true})} label="Password" placeholder="Enter your password" type="password" variant="bordered" />

            <div className="pb-2 text-red-700">
                {error && <div>{error}</div>}
                {errors.email && <div>Email is required</div>}
                {errors.password && <div>Password is required</div>}
            </div>

            <Button type="submit" color="primary" className={`${isLoading ? "bg-light text-dark":""}`} disabled={isLoading}>{isLoading ? "Loading ..." : "Sign In"}</Button>

            <Link href={"/auth/register"}> <Button className="ms-3" variant="bordered" color="primary">Register</Button> </Link>
            
        </form>
    )
}
