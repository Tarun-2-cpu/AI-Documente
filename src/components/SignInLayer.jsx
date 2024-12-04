import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'


const SignInLayer = () => {

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const[error,setError] = useState('');

    let navigate = useNavigate();

    function handleSubmit(e){

        if (email === 'bd@company.com') {
            localStorage.setItem('loggedInUser', 'BD');
            navigate('/business-development');
        } else if (email === 'pm@company.com') {
            localStorage.setItem('loggedInUser', 'PM');
            navigate('/project-management');
        } else if (email === 'engg@company.com') {
            localStorage.setItem('loggedInUser', 'ENG');
            navigate('/engineering-dashboard');
        } else if (email === 'qc@company.com') {
            localStorage.setItem('loggedInUser', 'QAQC');
            navigate('/qa-qc-dashboard');
        } else {
            setError ('Invalid login credentials. Please try again.');
        }
    }



    return (
        <section className="auth bg-base d-flex flex-wrap">
            <div className="auth-left d-lg-block d-none">
                <div className="d-flex align-items-center flex-column h-100 justify-content-center">
                    <img src="assets/images/auth/AI-dokumente-trans.png" alt="" />
                </div>
            </div>
            <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
                <div className="max-w-464-px mx-auto w-100">
                    <div>
                        <h4 className="mb-12">Sign In to your Account</h4>
                        <p className="mb-32 text-secondary-light text-lg">
                            Welcome back! please enter your detail
                        </p>
                    </div>
                    <form action="#">
                        <div className="icon-field mb-16">
                            <span className="icon top-50 translate-middle-y">
                                <Icon icon="mage:email" />
                            </span>
                            <input
                                type="email"
                                className="form-control h-56-px bg-neutral-50 radius-12"
                                placeholder="Email"
                                value={email}
                                onChange={(e)=>{setEmail(e.target.value)}}
                            />
                        </div>
                        <div className="position-relative mb-20">
                            <div className="icon-field">
                                <span className="icon top-50 translate-middle-y">
                                    <Icon icon="solar:lock-password-outline" />
                                </span>
                                <input
                                    type="password"
                                    className="form-control h-56-px bg-neutral-50 radius-12"
                                    id="your-password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e)=>{setPassword(e.target.value)}}
                                />
                            </div>
                            <span
                                className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                                data-toggle="#your-password"
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
                            onClick={handleSubmit}
                        >
                            {" "}
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </section>

    )
}

export default SignInLayer