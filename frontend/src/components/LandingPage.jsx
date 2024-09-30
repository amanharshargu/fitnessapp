import React, { useState, useEffect, useCallback } from "react";
import RecipeCard from "./recipes/StyledRecipeCard";
import { useRecipes } from "../contexts/RecipeContext";
import "../styles/LandingPage.css";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

function LandingPage() {
  const { getRandomRecipes, isLoading } = useRecipes();
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const fetchRandomRecipes = async () => {
    try {
      const recipes = await getRandomRecipes(3);
      setRandomRecipes(recipes);
      setFetchError(null);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      setFetchError("Failed to load recipes. Please try again later.");
    }
  };

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: "#198754",
      },
    },
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#ffffff",
      },
      opacity: {
        value: 0.5,
        random: false,
      },
      size: {
        value: 3,
        random: true,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
      links: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        onClick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
      },
    },
  };

  return (
    <div className="landing-page">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
      />
      <div className="container content-wrapper">
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <div
              className="card my-4 bg-dark text-white"
              style={{ width: "70%" }}
            >
              <div className="card-body-lp">
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
          <div className="d-flex align-items-center mb-4">
            <h3 className="me-3 mb-0">Featured Recipes</h3>
            <button 
              className="btn btn-outline-light" 
              onClick={fetchRandomRecipes}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Refresh Recipes
            </button>
          </div>
          {isLoading ? (
            <p>Loading recipes...</p>
          ) : fetchError ? (
            <p>{fetchError}</p>
          ) : (
            <div className="styled-recipe-card-container">
              {randomRecipes.map((recipe) => (
                <RecipeCard key={recipe.uri} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
