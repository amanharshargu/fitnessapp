import React, { useState, useEffect } from "react";
import RecipeCard from "./recipes/RecipeCard";
import bgImage from "../assets/bg.jpg";
import { useRecipes } from "../contexts/RecipeContext";
import "../styles/landingpage.css";

function LandingPage() {
  const { getRandomRecipes, isLoading } = useRecipes();
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRandomRecipes = async () => {
      try {
        const recipes = await getRandomRecipes(3);
        if (isMounted) {
          setRandomRecipes(recipes);
          setFetchError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching random recipes:", error);
          setFetchError("Failed to load recipes. Please try again later.");
        }
      }
    };
    fetchRandomRecipes();
    return () => {
      isMounted = false;
    };
  }, [getRandomRecipes]);

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        color: "white",
        position: "relative",
      }}
    >
      <div className="container" style={{ paddingTop: "120px" }}>
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <div className="card mb-5 bg-dark text-white" style={{ width: '70%' }}>
              <div className="card-body">
                <h2 className="card-title">
                  Welcome to Health & Fitness Tracker
                </h2>
                <p className="card-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam euismod, nisi vel consectetur interdum, nisl nunc
                  egestas nunc, vitae tincidunt nisl nunc euismod nunc. Sed
                  euismod, nisi vel consectetur interdum, nisl nunc egestas
                  nunc, vitae tincidunt nisl nunc euismod nunc.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <h3 className="mb-4">Featured Recipes</h3>
          {isLoading ? (
            <p>Loading recipes...</p>
          ) : fetchError ? (
            <p>{fetchError}</p>
          ) : (
            randomRecipes.map((recipe) => (
              <div key={recipe.uri} className="col-md-4 mb-4">
                <RecipeCard recipe={recipe} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
