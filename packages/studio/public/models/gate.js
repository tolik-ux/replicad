const { draw, makeBox, makeCompound } = replicad;

const defaultParams = {
  width: 1000,
  height: 2700,
  profile: 40,
  openingHeight: 2100,
  gap: 100,
};

//создаем алюминиевый профиль
const createAlumProfile = (width) => {
  return draw()
    .hLine(-7)
    .bulgeArc(0, 55, -0.15)
    .hLine(7)
    .bulgeArc(0, -55, 0.15)
    .close()
    .sketchOnPlane("YZ")
    .extrude(width);
};

//создает набор из алюминиевых профилей
const createDoorPanel = (width, height) => {
  const panelCount = Math.floor(height / 55);

  const doorPanel = [];

  for (let i = 0; i < panelCount; i++) {
    doorPanel.push(
      createAlumProfile(width)
        .clone()
        .translateZ(55 * i)
        .translateY(3),
    );
  }

  return makeCompound(doorPanel);
};

//собираем раму
const main = (_, { width, height, profile, openingHeight, gap}) => {
  //Создаем рамку
  const frame = makeBox([0, 0, 0], [width, profile, height])
    .cut(makeBox([profile, 0, 0], [width - profile, profile, openingHeight]))
    .cut(makeBox([profile, 0, openingHeight + profile], [width - profile, profile, height - profile]));
  
    //создаем полосу фальшпанели
  const stripfpanel = makeBox([0, 0, 0], [width, 4, height-openingHeight - 20]).cut(
    makeBox([60, 0, 60], [width - 60, 4, height-openingHeight - 80]),
  );

  //собираем дверь
  //вычисляем размер створки
  const doorHeight = openingHeight - gap - 10;
  const doorWidth = width - profile * 2 - 20;
  
  //создаем створку
  const frameDoor = makeBox([0, 0, 0], [doorWidth, profile, doorHeight]).cut(
    makeBox([profile, 0, profile], [doorWidth - profile, profile, doorHeight - profile]),
  );

  //создаем полосу створки
  const strip = makeBox([0, 0, 0], [doorWidth + 40, 4, doorHeight + 20]).cut(
    makeBox([80, 0, 60], [doorWidth - 40, 4, doorHeight - 40]),
  );

  return [
    frame,
    stripfpanel
      .translateZ(openingHeight+20)
      .translateY(-4),
    createDoorPanel(width - profile * 2 -4, height - openingHeight)
      .translateX(profile + 2)
      .translateY(9)
      .translateZ(openingHeight+profile),
    frameDoor
      .translateX(profile + 10)
      .translateZ(gap),
    strip
      .translateX(profile-10)
      .translateZ(gap)
      .translateY(-4),
    createDoorPanel(doorWidth - profile * 2, doorHeight - profile)
      .translateX(profile * 2 + 10)
      .translateY(9)
      .translateZ(gap + profile),
  ];
};
