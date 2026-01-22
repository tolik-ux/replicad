// Индексный файл для управления всеми моделями
// Этот файл позволяет легко добавлять новые модели в библиотеку

import gate from './gate.js';
import rollingDoor from './rolling-door.js';

// Список всех доступных моделей
export const models = {
  gate: {
    name: 'Калитка',
    description: 'Алюминиевая калитка с профилями',
    component: gate,
    defaultParams: {
      width: 1000,
      height: 2700,
      profile: 40,
      openingHeight: 2100,
      gap: 100,
    }
  },
  rollingDoor: {
    name: 'Рольставни',
    description: 'Рулонные ворота с алюминиевыми профилями',
    component: rollingDoor,
    defaultParams: {
      width: 3000,
      height: 2600,
      profile: 77,
      railWidth: 83,
      railDepth: 34,
      rollboxHeight: 300,
    }
  }
};

// Получить список названий моделей
export const getModelNames = () => Object.keys(models);

// Получить модель по имени
export const getModel = (name) => {
  return models[name]?.component;
};

// Получить информацию о модели
export const getModelInfo = (name) => {
  const model = models[name];
  if (!model) return null;
  
  return {
    name: model.name,
    description: model.description,
    defaultParams: model.defaultParams
  };
};

// Получить все модели
export const getAllModels = () => models;

// Создать модель по имени с параметрами
export const createModel = (name, params = {}) => {
  const model = models[name];
  if (!model) {
    throw new Error(`Модель "${name}" не найдена`);
  }
  
  return model.component(params);
};

// Получить параметры по умолчанию для модели
export const getDefaultParams = (name) => {
  const model = models[name];
  return model?.defaultParams || {};
};

// Экспорт для использования в сборках
export default {
  models,
  getModelNames,
  getModel,
  getModelInfo,
  getAllModels,
  createModel,
  getDefaultParams
};
