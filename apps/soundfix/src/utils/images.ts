import { Image } from "react-native";
import noimage from '../assets/images/no-image.png';
import noSong from '../assets/images/unknown_track.png';
import heart from '../assets/images/heart.png';
import avatar from '../assets/images/avatar.jpg'


export const notImage = Image.resolveAssetSource(noimage)?.uri
export const noSongImg = Image.resolveAssetSource(noSong)?.uri
export const notPerson = Image.resolveAssetSource(avatar)?.uri
export const Heart = Image.resolveAssetSource(heart)?.uri