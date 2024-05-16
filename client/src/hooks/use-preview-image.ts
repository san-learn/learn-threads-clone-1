import { useState } from "react";

import { useToastError } from "./use-toast-error";

export function usePreviewImage() {
  const [imageURL, setImageURL] = useState<string | null>(null);

  const toastError = useToastError();

  function handleChangeImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      toastError("Error", "Please select an image file");

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => setImageURL(reader.result as string);
    reader.readAsDataURL(file);
  }

  return { imageURL, setImageURL, handleChangeImage };
}
