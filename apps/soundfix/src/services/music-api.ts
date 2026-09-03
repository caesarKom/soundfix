import { Alert } from "react-native";
import { api } from "./api";

export const fetchMusic = async () => {
  const {data} = await api.get('/music');
  Alert.alert("Fetch music from api :", data)
  return await data
};

export const fetchPlaylists = async () => {
  const {data} = await api.get('/playlists');
  return await data
};