import { useState } from "react";

export function useCivilIssueAttachments({ maxFiles, maxFileSizeMB, onError }) {
  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (attachments.length + files.length > maxFiles) {
      onError?.(`You can only upload up to ${maxFiles} files.`);
      e.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxFileSizeMB * 1024 * 1024);
    if (oversizedFile) {
      onError?.(`File "${oversizedFile.name}" exceeds the ${maxFileSizeMB}MB limit.`);
      e.target.value = "";
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
    onError?.("");
    e.target.value = "";
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    attachments,
    handleFileChange,
    removeFile,
    setAttachments,
  };
}
