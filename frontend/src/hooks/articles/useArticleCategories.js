import { useEffect, useState } from "react";
import axios from "@/api/axios";

export const DEFAULT_ARTICLE_CATEGORIES = [
  "Family",
  "Property",
  "Work",
  "Consumer",
  "Finance",
];

export function useArticleCategories(initialCategories = DEFAULT_ARTICLE_CATEGORIES) {
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/articles/categories");
        if (!mounted) return;
        setCategories(res?.data?.categories || initialCategories);
      } catch (err) {
        if (!mounted) return;
        // keep existing categories on error
        setCategories(initialCategories);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, [initialCategories]);

  return categories;
}
