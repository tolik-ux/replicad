# Библиотека моделей Replicad Studio

Эта библиотека содержит готовые модели для использования в Replicad Studio.

## Структура библиотеки

```
models/
├── gate.js              # Модель калитки
├── rolling-door.js      # Модель рольставни
├── assembly.js          # Файл для создания сборок
├── index.js            # Индексный файл для управления моделями
└── README.md           # Этот файл
```

## Доступные модели

### 1. Калитка (gate.js)

Алюминиевая калитка с профилями и створкой.

**Параметры:**
- `width`: ширина калитки (по умолчанию 1000 мм)
- `height`: высота калитки (по умолчанию 2700 мм)
- `profile`: толщина профиля (по умолчанию 40 мм)
- `openingHeight`: высота проёма (по умолчанию 2100 мм)
- `gap`: зазор между створкой и рамой (по умолчанию 100 мм)

**Использование:**
```javascript
import gate from './gate.js';

const myGate = gate({
  width: 1000,
  height: 2700,
  profile: 40,
  openingHeight: 2100,
  gap: 100
});
```

### 2. Рольставни (rolling-door.js)

Рулонные ворота с алюминиевыми профилями.

**Параметры:**
- `width`: ширина ворот (по умолчанию 3000 мм)
- `height`: высота ворот (по умолчанию 2600 мм)
- `profile`: толщина профиля (по умолчанию 77 мм)
- `railWidth`: ширина направляющей (по умолчанию 83 мм)
- `railDepth`: глубина направляющей (по умолчанию 34 мм)
- `rollboxHeight`: высота короба (по умолчанию 300 мм)

**Использование:**
```javascript
import rollingDoor from './rolling-door.js';

const myRollingDoor = rollingDoor({
  width: 3000,
  height: 2600,
  profile: 77,
  railWidth: 83,
  railDepth: 34,
  rollboxHeight: 300
});
```

## Создание сборок

### Базовая сборка (assembly.js)

Создает сборку из нескольких моделей с ручным позиционированием.

```javascript
import main from './assembly.js';

const assembly = main({
  gate: {
    enabled: true,
    width: 1000,
    height: 2700,
    profile: 40,
    openingHeight: 2100,
    gap: 100,
  },
  rollingDoor: {
    enabled: true,
    width: 3000,
    height: 2600,
    profile: 77,
    railWidth: 83,
    railDepth: 34,
    rollboxHeight: 300,
  },
  layout: {
    gatePosition: [0, 0, 0],
    rollingDoorPosition: [1200, 0, 0],
  }
});
```

### Автоматическая сборка

Автоматически позиционирует все включенные модели.

```javascript
import { createAutoAssembly } from './assembly.js';

const autoAssembly = createAutoAssembly({
  gate: {
    enabled: true,
    width: 1000,
    height: 2700,
  },
  rollingDoor: {
    enabled: true,
    width: 3000,
    height: 2600,
  }
});
```

### Горизонтальная сборка

Располагает модели горизонтально с заданным интервалом.

```javascript
import { createHorizontalAssembly } from './assembly.js';

const horizontalAssembly = createHorizontalAssembly([
  { modelName: 'gate', params: { width: 1000, height: 2700 } },
  { modelName: 'rollingDoor', params: { width: 3000, height: 2600 } }
], 100);
```

### Вертикальная сборка

Располагает модели вертикально с заданным интервалом.

```javascript
import { createVerticalAssembly } from './assembly.js';

const verticalAssembly = createVerticalAssembly([
  { modelName: 'gate', params: { width: 1000, height: 2700 } },
  { modelName: 'rollingDoor', params: { width: 3000, height: 2600 } }
], 100);
```

### Сборка в сетку

Располагает модели в сетке с заданным количеством столбцов.

```javascript
import { createGridAssembly } from './assembly.js';

const gridAssembly = createGridAssembly([
  { modelName: 'gate', params: { width: 1000, height: 2700 } },
  { modelName: 'rollingDoor', params: { width: 3000, height: 2600 } }
], 2, [100, 100]);
```

## Использование в Replicad Studio

### Способ 1: Через Visualiser

1. Откройте `http://localhost:5173/visualiser`
2. Нажмите "Choose a file"
3. Выберите файл модели (например, `gate.js` или `rolling-door.js`)
4. Модель автоматически загрузится

### Способ 2: Через Workbench

1. Откройте `http://localhost:5173/workbench`
2. Скопируйте код из файла модели в редактор
3. Модель автоматически скомпилируется

### Способ 3: Через URL

Загрузите модель прямо из URL:
```
http://localhost:5173/visualiser?from-url=/models/gate.js
```

## Добавление новых моделей

### Шаг 1: Создайте файл модели

Создайте новый файл в папке `models/`, например `fence.js`:

```javascript
const { draw, makeBox } = replicad;

const defaultParams = {
  width: 2000,
  height: 2000,
  thickness: 50,
};

const main = (params = defaultParams) => {
  const { width, height, thickness } = params;
  
  return makeBox([0, 0, 0], [width, thickness, height]);
};

export { defaultParams };
export default main;
```

### Шаг 2: Добавьте модель в index.js

Откройте `index.js` и добавьте новую модель:

```javascript
import gate from './gate.js';
import rollingDoor from './rolling-door.js';
import fence from './fence.js';  // Добавьте импорт

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
  },
  fence: {  // Добавьте модель
    name: 'Забор',
    description: 'Простой забор',
    component: fence,
    defaultParams: {
      width: 2000,
      height: 2000,
      thickness: 50,
    }
  }
};
```

### Шаг 3: Используйте новую модель

Теперь вы можете использовать новую модель в сборках:

```javascript
import { createModel } from './index.js';

const myFence = createModel('fence', {
  width: 2000,
  height: 2000,
  thickness: 50
});
```

## Экспорт моделей

После загрузки модели в Replicad Studio вы можете экспортировать её в различные форматы:

- **STL** - для 3D печати
- **STEP** - для CAD программ
- **GLB/GLTF** - для веб-визуализации

Нажмите кнопку загрузки (иконка ↓) в правом верхнем углу визуализатора.

## Советы

1. **Параметризация**: Используйте параметры для создания гибких моделей
2. **Модульность**: Храните каждую модель в отдельном файле
3. **Документация**: Добавляйте комментарии к параметрам
4. **Тестирование**: Тестируйте модели с разными параметрами
5. **Версионирование**: Используйте git для отслеживания изменений

## Примеры

Примеры использования моделей можно найти в папке `examples/` (если она существует).

## Поддержка

Если у вас есть вопросы или предложения, пожалуйста, создайте issue в репозитории.
