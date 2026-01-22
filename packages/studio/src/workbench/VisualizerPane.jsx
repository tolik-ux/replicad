import React from "react";
import styled from "styled-components";

import Configure from "../icons/Configure";
import Clipping from "../icons/Clipping";
import Download from "../icons/Download";
import Plus from "../icons/Plus";
import ClippingParams from "../visualiser/editor/ClippingParams";
import { FaceInfo, EdgeInfo } from "../visualiser/editor/HighlighedInfo.jsx";
import { InfoBottomLeft, InfoTopRight } from "../components/FloatingInfo";
import DownloadDialog from "../visualiser/editor/DownloadDialog";
import ParamsEditor from "../visualiser/editor/ParamsEditor";
import ModelSelector from "../components/ModelSelector";
import LoadingScreen from "../components/LoadingScreen";
import EditorViewer from "../viewers/EditorViewer";

import { observer } from "mobx-react";

import useEditorStore from "../visualiser/editor/useEditorStore";
import { HeaderButton, HeaderSelect } from "./panes";
import Loading from "../icons/Loading";

const Spacer = styled.div`
  flex: 1;
`;

export const VisualizerButtons = observer(() => {
  const store = useEditorStore();
  const [showModelSelector, setShowModelSelector] = React.useState(false);

  return (
    <>
      {store.currentMesh.length > 1 && !store.error ? (
        <>
          <HeaderSelect
            value={store.ui.shapeIndex}
            onChange={(e) => store.ui.selectShape(parseInt(e.target.value))}
          >
            <option value={-1}>All Shapes</option>
            {store.currentMesh.map((s, i) => (
              <option value={i} key={s.name}>
                {s.name}
              </option>
            ))}
          </HeaderSelect>
          <Spacer />
        </>
      ) : null}

      <HeaderButton
        onClick={() => store.ui.changeDownload(true)}
        title="Download"
      >
        <Download />
      </HeaderButton>
      {!store.ui.currentIsSVG && (
        <HeaderButton
          solid={!store.ui.clip.disabled}
          small
          onClick={() => store.ui.clip.toggle()}
          title="Clipping plane"
        >
          <Clipping />
        </HeaderButton>
      )}
      {store.defaultParams && (
        <HeaderButton
          solid={store.ui.enableParams}
          small
          onClick={() => store.ui.changeEnableParams(!store.ui.enableParams)}
          title="Parameters"
        >
          <Configure />
        </HeaderButton>
      )}
  <HeaderButton
    onClick={() => setShowModelSelector(true)}
    title="Add Model"
  >
    <Plus />
  </HeaderButton>
</>
);
});

const LoadingInfo = styled(InfoBottomLeft)`
  color: var(--color-primary-light);
`;

export default observer(function VisualizerPane() {
  const store = useEditorStore();
  const [showModelSelector, setShowModelSelector] = React.useState(false);
  const [addedModels, setAddedModels] = React.useState([]);

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

  return (
    <>
      {store.shapeLoaded ? (
        <EditorViewer
          shape={shape}
          labels={store.currentLabels}
          hasError={store.hasError}
          clipDirection={store.ui.clip.planeVector}
          clipConstant={store.ui.clip.position}
          onSelected={store.ui.changeHighlight}
        />
      ) : (
        <LoadingScreen />
      )}
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
            
            // Создаем Blob и загружаем его через File System Access API
            const blob = new Blob([assemblyCode], { type: 'text/javascript' });
            const file = new File([blob], 'assembly.js', { type: 'text/javascript' });
            
            // Создаем file handle
            const fileHandle = {
              getFile: async () => file,
              name: 'assembly.js'
            };
            
            // Запускаем прослушивание файла
            setTimeout(() => {
              console.log('Запуск прослушивания файла');
              store.code.startListening(fileHandle);
              console.log('Прослушивание запущено');
            }, 200);
          }}
        />
      )}
      {store.ui.showDownload && (
        <DownloadDialog onClose={() => store.ui.changeDownload(false)} />
      )}

      {(store.selectedInfo.faceInitialized ||
        store.selectedInfo.edgeInitialized) && (
        <InfoBottomLeft>
          <FaceInfo />
          <EdgeInfo />
        </InfoBottomLeft>
      )}

      {store.shapeLoaded && store.processing && (
        <LoadingInfo noBg>
          <Loading size="3em" />
        </LoadingInfo>
      )}
    </>
  );
});
