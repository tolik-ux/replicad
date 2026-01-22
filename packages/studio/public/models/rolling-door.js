const { draw, makeBox, makeCompound } = replicad;

const defaultParams = {
  width: 3000,
  height: 2600,
  profile: 77,
  railWidth: 83,
  railDepth: 34,
  rollboxHeight: 300,
};

// Создаем алюминиевый профиль
const createAlumProfile = (width, profile) => {
  return draw()
    .hLine(-7)
    .bulgeArc(0, profile, -0.15)
    .hLine(7)
    .bulgeArc(0, -profile, 0.15)
    .close()
    .sketchOnPlane("YZ")
    .extrude(width - 80);
};

// Создает набор из алюминиевых профилей
const createAlumPanel = (width, height, profile) => {
  const panelCount = Math.floor(height / profile);
  const doorPanel = [];

  for (let i = 0; i < panelCount; i++) {
    doorPanel.push(
      createAlumProfile(width, profile)
        .clone()
        .translate([0, 0, profile * i])
        .translate([0, 3, 0])
    );
  }

  return makeCompound(doorPanel);
};

// Собираем модель
const main = (params = defaultParams) => {
  const {
    width = defaultParams.width,
    height = defaultParams.height,
    profile = defaultParams.profile,
    railWidth = defaultParams.railWidth,
    railDepth = defaultParams.railDepth,
    rollboxHeight = defaultParams.rollboxHeight
  } = params;

  // Создаем направляющие (рама)
  const frame = makeBox([0, 0, 0], [width, railDepth, height - rollboxHeight])
    .cut(makeBox([railWidth, 0, 0], [width - railWidth, railDepth, height - rollboxHeight]));
  
  // Создаем короб (рулонный ящик)
  const rollbox = makeBox([0, 0, 0], [width, rollboxHeight, rollboxHeight]);

  // Создаем полотно (алюминиевые профили)
  const canvas = createAlumPanel(width, height, profile);
  
  return [
    frame,
    rollbox
      .translate([0, 0, height - rollboxHeight]),
    canvas
      .translate([40, 15, 0]),
  ];
};

export { defaultParams };
export default main;
