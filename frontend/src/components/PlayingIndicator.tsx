const PlayingIndicator = () => {
	return (
		<div className="flex items-center justify-center gap-[3px] h-4">
			<div className="w-[3px] bg-green-500 rounded-full animate-playing-1" style={{ height: '100%' }} />
			<div className="w-[3px] bg-green-500 rounded-full animate-playing-2" style={{ height: '100%' }} />
			<div className="w-[3px] bg-green-500 rounded-full animate-playing-3" style={{ height: '100%' }} />
		</div>
	);
};

export default PlayingIndicator;
