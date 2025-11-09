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
	teacher: Teacher | string | { _id: string; name: string };
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	category: Category | string | { _id: string; name: string };
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

export interface Playlist {
	_id: string;
	name: string;
	description: string;
	userId: string;
	imageUrl: string;
	songs: Song[];
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
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
	albums?: Album[];
	songs?: Song[];
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalTeachers: number;
}

export interface User {
	_id: string;
	fullName: string;
	imageUrl: string;
	isAdmin?: boolean;
}
