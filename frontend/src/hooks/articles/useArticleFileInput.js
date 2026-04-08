import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useArticleFileInput() {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleChange = useCallback((event) => {
    const f = event.target.files && event.target.files[0];
    setFile(f || null);
  }, []);

  const openPicker = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const clear = useCallback(() => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return { file, setFile, inputRef, handleChange, openPicker, clear, previewUrl };
}
