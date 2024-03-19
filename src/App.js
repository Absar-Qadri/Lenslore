import { useEffect, useRef, useState } from "react";
import Loader from "./Animations/Loader";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Button({ open, onOpen }) {
  return (
    <button className="btn-toggle" onClick={() => onOpen((event) => !event)}>
      {open ? "–" : "+"}
    </button>
  );
}
const KEY = "c4872b44";

export default function App() {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 650);

  const { movies, isLoading, isError } = useMovie(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectId(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleOnCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 650);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {isSmallScreen ? (
          <>
            {!selectedId ? (
              <Box>
                {isLoading && !isError && (
                  <Loader
                    type="bubbles"
                    color="#dee2e6"
                    height={150}
                    width={80}
                  />
                )}
                {!isLoading && !isError && (
                  <>
                    {!active ? (
                      <>
                        <button
                          className="list-btn"
                          onClick={() => setActive(true)}
                        >
                          &rarr;
                        </button>
                        <MovieList
                          movies={movies}
                          onSelectId={handleSelectId}
                        />
                      </>
                    ) : (
                      <>
                        <button
                          className="list-btn"
                          onClick={() => setActive(false)}
                        >
                          &larr;
                        </button>
                        <WatchedSummary
                          watched={watched}
                          active={active}
                          onActive={setActive}
                        />
                        <WatchedList
                          watched={watched}
                          onDeleteWatched={handleDeleteWatched}
                        />
                      </>
                    )}
                  </>
                )}
                {isError && <ErrorMessage message={isError} />}
              </Box>
            ) : (
              <Box>
                <MovieDetails
                  selectedId={selectedId}
                  onCloseMovie={() => {
                    handleOnCloseMovie();
                    // Optionally reset active to false to go back to the MovieList
                    setActive(false);
                  }}
                  onAddWatched={handleAddWatched}
                  watched={watched}
                />
              </Box>
            )}
          </>
        ) : (
          <>
            {/* Large screen layout remains the same as before */}
            <Box>
              {isLoading && !isError && (
                <Loader
                  type="bubbles"
                  color="#dee2e6"
                  height={150}
                  width={80}
                />
              )}
              {!isLoading && !isError && (
                <MovieList movies={movies} onSelectId={handleSelectId} />
              )}
              {isError && <ErrorMessage message={isError} />}
            </Box>
            {!selectedId ? (
              <Box>
                <WatchedSummary
                  watched={watched}
                  active={active}
                  onActive={setActive}
                />
                <WatchedList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
              </Box>
            ) : (
              <Box>
                <MovieDetails
                  selectedId={selectedId}
                  onCloseMovie={handleOnCloseMovie}
                  onAddWatched={handleAddWatched}
                  watched={watched}
                />
              </Box>
            )}
          </>
        )}
      </Main>
    </>
  );
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      {message}
      <span>😓</span>
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🔍</span>
      <h1>Lenslore</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  if (!movies) return;
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={`box`}>
      <Button open={isOpen} onOpen={setIsOpen} />
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectId={onSelectId} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectId }) {
  return (
    <li onClick={() => onSelectId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [movieLoding, setMovieLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating: Number(userRating),
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      try {
        setMovieLoading(true);
        async function getMovieDetails() {
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );
          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          setMovie(data);
          setMovieLoading(false);
        }
        getMovieDetails();
      } catch (err) {
        console.error(err.message);
      }
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "Lenslore";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {movieLoding ? (
        <Loader type="bubbles" color="#dee2e6" height={150} width={80} />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &#8592;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You gave {title} {watchedUserRating}⭐ rating
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function WatchedSummary({ watched, active, onActive }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <button className="summary-btn" onClick={() => onActive(!active)}>
        &#8592;
      </button>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
