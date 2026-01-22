import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button } from "./Button.jsx";
import axios from "axios";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background-color: var(--bg-color);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  padding: 2em;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 0 0 1.5em 0;
  color: var(--color-primary);
`;

const ModelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const ModelItem = styled.div`
  border: 1px solid var(--color-primary-light);
  border-radius: 4px;
  padding: 1em;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-primary-light);
    transform: translateY(-2px);
  }
`;

const ModelName = styled.h3`
  margin: 0 0 0.5em 0;
  font-size: 1.1em;
`;

const ModelDescription = styled.p`
  margin: 0 0 1em 0;
  color: var(--color-text-secondary);
  font-size: 0.9em;
`;

const ParamsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0.5em;
`;

const ParamTag = styled.span`
  background-color: var(--color-primary-dark);
  color: white;
  padding: 0.25em 0.5em;
  border-radius: 3px;
  font-size: 0.8em;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1px solid var(--color-primary-light);
`;

// Функция для загрузки кода модели
const loadModelCode = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки модели:', error);
    throw error;
  }
};

// Список доступных моделей
const availableModels = [
  {
    name: 'gate',
    displayName: 'Калитка',
    description: 'Алюминиевая калитка с профилями и створкой',
    params: ['width', 'height', 'profile', 'openingHeight', 'gap'],
    defaultParams: {
      width: 1000,
      height: 2700,
      profile: 40,
      openingHeight: 2100,
      gap: 100,
    },
    url: '/models/gate.js'
  },
  {
    name: 'rollingDoor',
    displayName: 'Рольставни',
    description: 'Рулонные ворота с алюминиевыми профилями',
    params: ['width', 'height', 'profile', 'railWidth', 'railDepth', 'rollboxHeight'],
    defaultParams: {
      width: 3000,
      height: 2600,
      profile: 77,
      railWidth: 83,
      railDepth: 34,
      rollboxHeight: 300,
    },
    url: '/models/rolling-door.js'
  }
];

export default function ModelSelector({ onClose, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleModelSelect = async (model) => {
    setLoading(true);
    setError(null);
    
    try {
      const code = await loadModelCode(model.url);
      onSelect(code);
      onClose();
    } catch (err) {
      setError('Не удалось загрузить модель. Попробуйте снова.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>Выберите модель</Title>
        {error && (
          <ErrorText>{error}</ErrorText>
        )}
        <ModelList>
          {availableModels.map((model) => (
            <ModelItem
              key={model.name}
              onClick={() => !loading && handleModelSelect(model)}
              disabled={loading}
            >
              <ModelName>{model.displayName}</ModelName>
              <ModelDescription>{model.description}</ModelDescription>
              <ParamsList>
                {model.params.map((param) => (
                  <ParamTag key={param}>{param}</ParamTag>
                ))}
              </ParamsList>
            </ModelItem>
          ))}
        </ModelList>
        <ButtonContainer>
          <Button onClick={onClose} disabled={loading}>
            {loading ? 'Загрузка...' : 'Отмена'}
          </Button>
        </ButtonContainer>
      </Dialog>
    </Overlay>
  );
}

const ErrorText = styled.p`
  color: red;
  margin: 0 0 1em 0;
`;
