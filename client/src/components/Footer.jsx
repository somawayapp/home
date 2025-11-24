import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react';

const Footer = () => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
    
    className='px-6   md:px-30 bg-bgColor pt-6 lg:px-24 xl:px-32 mt-30 md:mt-60 text-sm text-gray-700'>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            
            className='flex flex-wrap justify-between items-start gap-8 pb-6 border-borderColor border-b'>
                <div>

                    
           <div className='text-primary'>
              <svg
    width="92"
    height="32"
   
    style={{ display: "block" }}
  
 viewBox="0 0 3490 1080" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hodii logo">
  
  <path d="
    M949.278 666.715
    C875.957 506.859 795.615 344.664 713.713 184.809
    C698.893 155.177 670.813 98.2527 645.852 67.8412
    C609.971 24.1733 556.93 0.779785 503.109 0.779785
    C449.288 0.779785 396.247 24.1733 360.366 67.8412
    C335.406 98.2527 307.325 155.177 292.505 184.809
    C210.603 344.664 130.262 506.859 56.9404 666.715
    C47.5802 687.769 24.9598 737.675 16.3796 760.289
    C6.23941 787.581 0.779297 817.213 0.779297 846.845
    C0.779297 975.509 101.401 1079.22 235.564 1079.22
    C346.326 1079.22 400 1015 400 940
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M400 940
    C400 930 400 470 400 470
    M400 705 L600 705
    M600 470
    C600 470 600 930 600 940
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="
    M600 940
    C610 1010 640 1079.22 770.655 1079.22
    C904.817 1079.22 1006.22 975.509 1006.22 846.845
    C1006.22 817.213 999.979 787.581 989.839 760.289
    C981.259 737.675 958.638 687.769 949.278 666.715
  " fill="none" stroke="currentColor" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>

  <text x="1200" y="650" font-family="Arial, sans-serif" font-size="800" font-weight="550" fill="currentColor" dominant-baseline="middle">hodii</text>
</svg>

</div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}

                    className='max-w-80 mt-3'>
                        Are you looking for a place to call home. With over 7,500+ listings,
                        Hodii is the place to find your dream home. 
.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    
                    className='flex items-center gap-3 mt-6'>
                        <a href="#"> <img src={assets.facebook_logo} className='w-5 h-5' alt="" /> </a>
                        <a href="#"> <img src={assets.instagram_logo} className='w-5 h-5' alt="" /> </a>
                        <a href="#"> <img src={assets.twitter_logo} className='w-5 h-5' alt="" /> </a>
                        <a href="#"> <img src={assets.gmail_logo} className='w-5 h-5' alt="" /> </a>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}

                className='flex flex-wrap justify-between w-1/2 gap-8'>

                <div>
                    <h2 className='text-base font-medium text-gray-900 uppercase'>Quick Links</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">All Listings</a></li>
                        <li><a href="/owner">List Your Property </a></li>
                        <li><a href="/about-us">About Us</a></li>
                    </ul>
                </div>

                <div>
                    <h2 className='text-base font-medium text-gray-900 uppercase'>Resources</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="/help-center">Help Center</a></li>
                        <li><a href="/terms-of-service">Terms of Service</a></li>
                        <li><a href="/privacy-policy">Privacy Policy</a></li>
                        <li><a href="/careers">Careers</a></li>
                    </ul>
                </div>

                <div>
                    <h2 className='text-base font-medium text-gray-900 uppercase'>Contact</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li>A104 Waiyaki Way </li>
                        <li>Westlands NRB 00800 </li>
                        <li>+254 703 394 794</li>
                        <li>info.hodii@gmail.com</li>
                    </ul>
                </div>

                </motion.div>
                

                  
                

            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                
            className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} Hodii. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="/privacy-policy">Privacy</a></li>
                    <li>|</li>
                    <li><a href="/terms-of-service">Terms</a></li>
                    <li>|</li>
                    <li><a href="/privacy-policy">Cookies</a></li>
                </ul>
            </motion.div>
        </motion.div>
  )
}

export default Footer
