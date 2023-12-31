import React, { useState } from 'react';
import PocketBase from 'pocketbase';

import '../styles/card.css';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import defaultImage from '/placeholder-no-image.png';
import addIcon from '/heart.svg';
import removeIcon from '/heart-filled.svg';

import { useTranslation } from "react-i18next";

interface CardProps {
  media: MovieType | SerieType;
  onRemoveFromFavorites?: (movie: MovieType | SerieType) => void;
  onMediaClick?: (movie: MovieType | SerieType) => void;
}

const Icon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const Card: React.FC<CardProps> = ({ media, onMediaClick }) => {
  const { t } = useTranslation();
  const pb = new PocketBase('https://shoten-api.pockethost.io');

  const [isHovered, setIsHovered] = useState(false);
  const isMovieType = media.type === 'movie';

  const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const [favorites, setFavorites] = useState(storedFavorites);
  
  const isFavorite = favorites.some((fav: any) => fav.id === media.id);
  
  const hasPoster = media.poster_path !== null && media.poster_path !== undefined;
  
  const handleAddToFavorites = async () => {
    const user = pb.authStore.model;

    const updatedFavorites = isFavorite
    ? favorites.filter((fav: any) => fav.id !== media.id)
    : [...favorites, media];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    const data = {
      "username":user?.username,
      "favorites":updatedFavorites
    }
    await pb.collection('users').update(user?.id || "", data);

    if (isFavorite) {
      toast.info(t("removeCardFav"), {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      window.location.reload();
    } else {
      toast.success(t('addCardFav'),{
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  };

  return (
    <div
      className={`card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasPoster ? (
        <Link
          to={isMovieType ? `/movies/${media.id}` : `/tv-series/${media.id}`}
          onClick={() => onMediaClick?.(media)}
        >
          <img
            className="card-image"
            src={`https://image.tmdb.org/t/p/w500/${media.poster_path}`}
            alt={isMovieType ? media.title : (media as SerieType).name}
          />
        </Link>
      ) : (
        <img className="card-image" src={defaultImage} alt="Imagen predeterminada" />
      )}
      <button className="add-to-favorites-button" onClick={handleAddToFavorites}>
        <Icon src={isFavorite ? removeIcon : addIcon} alt={isFavorite ? 'remove icon' : 'add icon'} />
      </button>

      <div className="card-content">
        <div className='card-content-top'>
        </div>
        <div className="vote-container">
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Card;
