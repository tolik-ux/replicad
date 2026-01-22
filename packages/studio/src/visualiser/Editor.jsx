import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import styled from "styled-components";

import { Button, ButtonBar } from "../components/Button.jsx";
import {
  InfoBottomLeft,
  InfoTopRight as InfoTopRightRaw,
} from "../components/FloatingInfo.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";

import Download from "../icons/Download.jsx";
import Configure from "../icons/Configure.jsx";
import Reload from "../icons/Reload.jsx";
import Clipping from "../icons/Clipping.jsx";
import Plus from "../icons/Plus.jsx";

import EditorViewer from "../viewers/EditorViewer.jsx";

import Toolbar from "../components/Toolbar.jsx";

import ParamsEditor from "./editor/ParamsEditor.jsx";
import ClippingParams from "./editor/ClippingParams.jsx";
import DownloadDialog from "./editor/DownloadDialog.jsx";
import ModelSelector from "../components/ModelSelector.jsx";
import useEditorStore, { EditorContextProvider } from "./editor/useEditorStore";

import {
  loadFile,
  requestFile,
  getSavedHandleName,
} from "../utils/diskFileAccess.js";

const InfoTopRight = styled(InfoTopRightRaw)`
  min-width: 180px;
  & > :not(:last-child) {
    margin-bottom: 1em;
  }
`;

const Select = styled.select`
  font-size: 0.8em;
  margin-right: 1.5em;
`;

const ErrorOverlay = styled(InfoBottomLeft)`
  border-color: red;
  background-color: var(--bg-color);
  border-width: 2px;
  max-height: initial;
  max-width: 50vw;
  max-height: 90vw;

  & > :first-child {
    color: red;
  }

  & > :nth-child(2) {
    font-size: 1.2em;
  }

  & > pre {
    font-size: 0.6em;
    overflow-x: auto;
    padding: 1em;
    color: #444;
    background-color: #f2e0de;
  }
`;

const CenterInfo = styled.div`
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
`;

const WelcomeScreen = observer(() => {
  const store = useEditorStore();

  const [savedHandleName, setSavedHandleName] = useState(null);
  useEffect(() => {
    getSavedHandleName().then(setSavedHandleName);
  }, []);

  const askForAccess = () => {
    requestFile().then((file) => {
      if (file) {
        store.code.startListening(file);
      }
    });
  };

  const initFromSaved = () => {
    loadFile().then((file) => {
      store.code.startListening(file);
    });
  };

  return (
    <CenterInfo>
      <h4>Select a file to build and visualise!</h4>
      <Button solid onClick={askForAccess}>
        Choose a file
      </Button>
      {savedHandleName && (
        <p>
          Open previous file:
          <a
            onClick={(e) => {
              e.preventDefault();
              initFromSaved();
            }}
          >
            {savedHandleName}
          </a>
        </p>
      )}
      <p>
        If you need help for building your models, you can have a look at{" "}
        <a
          href="https://replicad.xyz"
          rel="noopener noreferrer"
          target="_blank"
        >
          our documentation
        </a>
        .
      </p>
    </CenterInfo>
  );
});

const EditorView = observer(function Editor() {
  const store = useEditorStore();
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [addedModels, setAddedModels] = useState([]);

  const shape = store.ui.shapeSelected;

  // Функция для генерации кода сборки из списка моделей
  const generateAssemblyCode = (models) => {
    if (models.length === 0) return '';
    
    // Если только одна модель, возвращаем её код напрямую
    if (models.length === 1) {
      return models[0].code;
    }

    // Извлекаем импорты из всех моделей и объединяем их
    const allImports = new Set();
    const modelCodes = [];

    models.forEach((model, index) => {
      // Извлекаем импорты
      const importMatch = model.code.match(/^const\s+\{[^}]+\}\s*=\s*replicad;?\s*$/m);
      if (importMatch) {
        const importLine = importMatch[0].trim();
        // Извлекаем имена импортируемых переменных
        const varMatch = importLine.match(/\{([^}]+)\}/);
        if (varMatch) {
          const vars = varMatch[1].split(',').map(v => v.trim());
          vars.forEach(v => allImports.add(v));
        }
      }

      // Убираем импорты, export default и переименовываем main
      let modelCode = model.code
        .replace(/^const\s+\{[^}]+\}\s*=\s*replicad;?\s*$/m, '')
        .replace(/export default main;?/g, '')
        .replace(/const main = /g, `const model${index}Main = `)
        .trim();
      
      // Переименовываем defaultParams в каждой модели
      modelCode = modelCode.replace(/const defaultParams = /g, `const defaultParams${index} = `);
      
      // Оборачиваем код модели в IIFE для создания отдельной области видимости
      modelCodes.push(`
// Модель ${index + 1}: ${model.name}
(() => {
${modelCode}
  window.model${index}Main = model${index}Main;
})();
`);
    });

    // Создаем объединенный импорт
    const combinedImport = `const { ${Array.from(allImports).join(', ')} } = replicad;`;

    const assemblyCode = `
// Автоматически сгенерированная сборка из ${models.length} моделей
${combinedImport}

${modelCodes.join('\n\n')}

const main = () => {
  const assembly = [];
  ${models.map((model, index) => {
    const offset = models.slice(0, index).reduce((sum, m) => sum + (m.width || 1000) + 100, 0);
    // Определяем параметры для вызова функции
    const paramsStr = model.defaultParams ? JSON.stringify(model.defaultParams) : '{}';
    return `
  // Модель ${index + 1}: ${model.name}
  let model${index}Result;
  try {
    // Пытаемся вызвать с параметрами по умолчанию
    model${index}Result = window.model${index}Main(${paramsStr});
  } catch (e) {
    // Если не работает, пробуем вызвать с пустым объектом
    try {
      model${index}Result = window.model${index}Main({});
    } catch (e2) {
      // Если и это не работает, пробуем вызвать без параметров
      model${index}Result = window.model${index}Main();
    }
  }
  if (Array.isArray(model${index}Result)) {
    model${index}Result.forEach(shape => {
      assembly.push(shape.translate([${offset}, 0, 0]));
    });
  } else {
    assembly.push(model${index}Result.translate([${offset}, 0, 0]));
  }
`;
  }).join('\n')}

  return assembly;
};

export default main;
`;

    return assemblyCode;
  };

  // Удаляем WelcomeScreen, чтобы сразу открывался визуализатор
  // if (!store.code.listeningFileOnDisk && !store.currentMesh?.length) {
  //   return <WelcomeScreen />;
  // }

  return (
    <>
      {store.shapeLoaded ? (
        <EditorViewer
          shape={shape}
          hasError={store.hasError}
          clipDirection={store.ui.clip.planeVector}
          clipConstant={store.ui.clip.position}
        />
      ) : (
        <LoadingScreen />
      )}
      <Toolbar>
        <ButtonBar>
          {store.currentMesh.length > 1 && !store.error ? (
            <Select
              value={store.ui.shapeIndex}
              onChange={(e) => store.ui.selectShape(parseInt(e.target.value))}
            >
              <option value={-1}>All Shapes</option>
              {store.currentMesh.map((s, i) => (
                <option value={i} key={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          ) : null}

          <Button
            small
            solid={store.code.listeningFileOnDisk}
            onClick={() => {
              if (store.code.listeningFileOnDisk) {
                store.code.stopListening();
              }
              requestFile().then((file) => {
                store.code.startListening(file);
              });
            }}
          >
            <Reload />
          </Button>

          <Button small onClick={() => store.ui.changeDownload(true)}>
            <Download />
          </Button>
          {!store.ui.currentIsSVG && (
            <Button
              solid={!store.ui.clip.disabled}
              small
              onClick={() => store.ui.clip.toggle()}
            >
              <Clipping />
            </Button>
          )}
          {store.defaultParams && (
            <Button
              solid={store.ui.enableParams}
              small
              onClick={() =>
                store.ui.changeEnableParams(!store.ui.enableParams)
              }
            >
              <Configure />
            </Button>
          )}
          <Button small onClick={() => setShowModelSelector(true)}>
            <Plus />
          </Button>
        </ButtonBar>
      </Toolbar>
      {(!store.ui.clip.disabled ||
        (store.ui.enableParams && store.defaultParams)) && (
        <InfoTopRight>
          {!store.ui.clip.disabled && <ClippingParams />}
          {store.ui.enableParams && store.defaultParams && (
            <ParamsEditor
              defaultParams={store.defaultParams}
              onRun={store.process}
            />
          )}
        </InfoTopRight>
      )}
      {showModelSelector && (
        <ModelSelector
          onClose={() => setShowModelSelector(false)}
          onSelect={async (code, modelInfo) => {
            console.log('Добавление модели:', modelInfo?.name || 'неизвестная');
            
            // Добавляем новую модель в список
            const newModel = {
              name: modelInfo?.name || 'model',
              displayName: modelInfo?.displayName || modelInfo?.name || 'model',
              code: code,
              width: modelInfo?.defaultParams?.width || 1000,
              height: modelInfo?.defaultParams?.height || 2000,
              defaultParams: modelInfo?.defaultParams || {},
            };
            
            const updatedModels = [...addedModels, newModel];
            setAddedModels(updatedModels);
            
            // Генерируем код сборки из всех моделей
            const assemblyCode = generateAssemblyCode(updatedModels);
            
            console.log('Сгенерирован код сборки:', assemblyCode.substring(0, 200) + '...');
            
            // Обновляем код в редакторе напрямую и сохраняем в localStorage
            store.code.update(assemblyCode, true);
          }}
        />
      )}
      {store.ui.showDownload && (
        <DownloadDialog onClose={() => store.ui.changeDownload(false)} />
      )}
      {store.error && (
        <ErrorOverlay>
          <div>Error</div>
          <div>{store.error?.message}</div>
          {store.error.stack && <pre>{store.error.stack}</pre>}
        </ErrorOverlay>
      )}
    </>
  );
});

export default (props) => {
  return (
    <EditorContextProvider>
      <EditorView {...props} />
    </EditorContextProvider>
  );
};
