import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	// Google One Tap handles sign in automatically, this button is just for manual trigger if needed
	const handleSignIn = () => {
		// Optional: You can trigger Google One Tap manually here if needed
		console.log("Sign in button clicked - Google One Tap should handle authentication");
	};

	return (
		<Button onClick={handleSignIn} variant={"secondary"} className='w-full text-white border-zinc-200 h-11'>
			<img src='/google.png' alt='Google' className='size-5' />
			Đăng nhập với Google
		</Button>
	);
};
export default SignInOAuthButtons;
