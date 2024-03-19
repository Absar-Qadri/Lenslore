import { useEffect, useState } from "react";

export function useMovie(query, callBack) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState("");

  const KEY = "c4872b44";

  useEffect(
    function () {
      callBack?.();
      if (query.length < 3) {
        setMovies([]);
        setIsError("");
        return;
      }
      const controller = new AbortController();

      async function moviesFetch() {
        try {
          setIsLoading(true);
          setIsError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wrong");
          }
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie Not Found!");
          }
          setMovies(data.Search);
          setIsError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setIsError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      moviesFetch();

      return function () {
        controller.abort();
      };
    },
    [query, callBack]
  );
  return { movies, isLoading, isError };
}
