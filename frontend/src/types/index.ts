export interface Category {
	_id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Song {
	_id: string;
	title: string;
	teacher: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	category: Category | string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	_id: string;
	title: string;
	teacher: Teacher | string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
}

export interface Teacher {
	_id: string;
	name: string;
	bio: string;
	imageUrl: string;
	specialization: string;
	yearsOfExperience: number;
	createdAt: string;
	updatedAt: string;
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalTeachers: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
}
