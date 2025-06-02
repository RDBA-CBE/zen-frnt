import { useState } from "react";

export const useSetState = (initialState: any) => {
  const [state, setState] = useState(initialState);

  const newSetState = (newState: any) => {
    setState((prevState: any) => ({ ...prevState, ...newState }));
  };
  return [state, newSetState];
};

export const objIsEmpty = (obj: object) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

export const capitalizeFLetter = (string = "") => {
  if (string.length > 0) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string;
};

export const Dropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: item[label],
  }));
  return array;
};


export const MultiDropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    name: item[label],
  }));
  return array;
};

export const UserDropdown = (arr: any, labelFn: (item: any) => string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: labelFn(item),
  }));
  return array;
};

export const getFileNameFromUrl = (url: string) => {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
  return filename;
};

export const convertUrlToFile = async (url: any, filename: any) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export const isValidImageUrl = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

export const getTimeOnly = (date: Date | null) => {
  return date ? new Date(0, 0, 0, date.getHours(), date.getMinutes()) : null;
};

export const createTime = (date: Date | string | number | null) => {
  const source = date ? new Date(date) : new Date(); // ensure it's a Date object

  if (isNaN(source.getTime())) {
    // fallback in case the date is invalid
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }

  return new Date(0, 0, 0, source.getHours(), source.getMinutes());
};

export const isToday = (date: Date | null) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
