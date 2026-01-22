// Файл для создания сборок из нескольких моделей
// Позволяет объединять калитку, рольставни и другие модели

import { createModel, getAllModels } from './index.js';

const defaultParams = {
  // Параметры для калитки
  gate: {
    enabled: true,
    width: 1000,
    height: 2700,
    profile: 40,
    openingHeight: 2100,
    gap: 100,
  },
  // Параметры для рольставни
  rollingDoor: {
    enabled: true,
    width: 3000,
    height: 2600,
    profile: 77,
    railWidth: 83,
    railDepth: 34,
    rollboxHeight: 300,
  },
  // Позиционирование моделей
  layout: {
    gatePosition: [0, 0, 0],
    rollingDoorPosition: [1200, 0, 0],
  }
};

// Создает сборку из нескольких моделей
const main = (params = defaultParams) => {
  const {
    gate: gateParams,
    rollingDoor: rollingDoorParams,
    layout: layoutParams
  } = params;

  const assembly = [];

  // Добавляем калитку, если включена
  if (gateParams?.enabled) {
    const gateModel = createModel('gate', gateParams);
    const positionedGate = gateModel.map(shape => 
      shape.translate(layoutParams?.gatePosition || [0, 0, 0])
    );
    assembly.push(...positionedGate);
  }

  // Добавляем рольставни, если включены
  if (rollingDoorParams?.enabled) {
    const rollingDoorModel = createModel('rollingDoor', rollingDoorParams);
    const positionedRollingDoor = rollingDoorModel.map(shape => 
      shape.translate(layoutParams?.rollingDoorPosition || [1200, 0, 0])
    );
    assembly.push(...positionedRollingDoor);
  }

  return assembly;
};

// Создает сборку с автоматическим позиционированием
export const createAutoAssembly = (config = {}) => {
  const models = getAllModels();
  const assembly = [];
  let currentPosition = [0, 0, 0];

  for (const [modelName, modelConfig] of Object.entries(models)) {
    if (config[modelName]?.enabled !== false) {
      const modelParams = config[modelName] || modelConfig.defaultParams;
      const model = createModel(modelName, modelParams);
      
      const positionedModel = model.map(shape => 
        shape.translate(currentPosition)
      );
      
      assembly.push(...positionedModel);
      
      // Сдвигаем позицию для следующей модели
      currentPosition[0] += (modelParams.width || modelConfig.defaultParams.width) + 100;
    }
  }

  return assembly;
};

// Создает сборку с горизонтальным расположением
export const createHorizontalAssembly = (modelConfigs = [], spacing = 100) => {
  const assembly = [];
  let currentX = 0;

  for (const config of modelConfigs) {
    const { modelName, params = {} } = config;
    const model = createModel(modelName, params);
    
    const positionedModel = model.map(shape => 
      shape.translate([currentX, 0, 0])
    );
    
    assembly.push(...positionedModel);
    
    // Сдвигаем позицию для следующей модели
    currentX += (params.width || 1000) + spacing;
  }

  return assembly;
};

// Создает сборку с вертикальным расположением
export const createVerticalAssembly = (modelConfigs = [], spacing = 100) => {
  const assembly = [];
  let currentY = 0;

  for (const config of modelConfigs) {
    const { modelName, params = {} } = config;
    const model = createModel(modelName, params);
    
    const positionedModel = model.map(shape => 
      shape.translate([0, currentY, 0])
    );
    
    assembly.push(...positionedModel);
    
    // Сдвигаем позицию для следующей модели
    currentY += (params.height || 2000) + spacing;
  }

  return assembly;
};

// Создает сборку в сетке
export const createGridAssembly = (modelConfigs = [], cols = 2, spacing = [100, 100]) => {
  const assembly = [];
  const [xSpacing, ySpacing] = spacing;

  modelConfigs.forEach((config, index) => {
    const { modelName, params = {} } = config;
    const model = createModel(modelName, params);
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const x = col * ((params.width || 1000) + xSpacing);
    const y = row * ((params.height || 2000) + ySpacing);
    
    const positionedModel = model.map(shape => 
      shape.translate([x, y, 0])
    );
    
    assembly.push(...positionedModel);
  });

  return assembly;
};

export { defaultParams };
export default main;
