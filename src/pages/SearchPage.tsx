import axios from 'axios';
import { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import Card from '../components/Card';
import noSearchFoundIcon from '/notResultsFoundIcon.png';
import { useTranslation } from 'react-i18next';

const api_key = import.meta.env.VITE_API_KEY;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  overflow-x: hidden;
  padding: 3rem;
  background-color: #121212;
  @media (max-width: 600px) {
    margin-top: 5rem;
    padding: 3rem 0 3rem 0;
  }
`;

const SearchBarContainer = styled.form`
  display: flex;
  justify-content: center;
  margin-top: 5rem;
  width: 75%;
  position: relative;
  overflow-x: hidden;
`;

const SearchBarInput = styled.input`
  width: 100%;
  height: 30px;
  padding: 40px 40px 40px 40px;
  font-size: 30px;
  border: 1px solid #ccc;
  border-radius: 25px;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #f8b500;
    box-shadow: 0 0 5px rgba(248, 181, 0, 0.5);
  }

  @media (max-width: 600px) {
    width: 100%;
    height: 25px;
    font-size: 25px;
  }
`;

const ResultContainer = styled.div`
  min-height: 50vh;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 75px;
  justify-items: center;
  align-items: start;
  padding: 1rem;
`;

const NoResultDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 15rem;
`
const NoResultText = styled.div`
  font-size: 36px;
  text-align: center;
  color: white;
  @media (max-width: 600px) {
    font-size: 25px;
  }
`

const Image = styled.img`
  width: 100px;
  height: 100px;
  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
  }
`;

export default function SearchPage({ onMediaClick }: { onMediaClick: (media: MovieType | SerieType) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(MovieType | SerieType)[]>([]);

  const {t} = useTranslation();

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    try {
      if (newSearchTerm) {
        const responses = [];

        for (let page = 1; page <= 10; page++) {
          const response = await axios.get(
            `https://api.themoviedb.org/3/search/multi?api_key=${api_key}&query=${newSearchTerm}&page=${page}`
          );

          responses.push(response.data);
        }

        const searchResults: (MovieType | SerieType)[] = [];

        responses.forEach(response => {
          const enhancedResults = response.results.map((item: { media_type: string; }) => {
            const mediaType = item.media_type;

            if (mediaType === 'movie') {
              return {
                type: 'movie',
                ...item
              };
            } else if (mediaType === 'tv') {
              return {
                type: 'serie',
                ...item
              };
            }

            return item;
          });

          searchResults.push(...enhancedResults);
        });

        setSearchResults(searchResults || []);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }

  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <PageContainer>
      <SearchBarContainer onSubmit={handleFormSubmit}>
        <SearchBarInput
          type="text"
          placeholder={t("placeholderSearch")}
          value={searchTerm}
          onChange={handleInputChange}
        />
      </SearchBarContainer>
      <ResultContainer>
        {searchResults.length > 0 ? (
          <>
            {searchResults.map((media) => (
              <div key={media.id}>

                <Card media={media} onMediaClick={onMediaClick} />
              </div>
            ))}
          </>
        ) : (
          <NoResultDiv>
            <Image src={noSearchFoundIcon} alt="no search found icon" />
            <NoResultText>{t("noResultMessage")}</NoResultText>
          </NoResultDiv>
        )}
      </ResultContainer>
    </PageContainer>
  );
};