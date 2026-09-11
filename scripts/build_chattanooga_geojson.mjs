import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const elevationDir = 'public/data/elevation/chattanooga';
const outputDir = 'public/data/chattanooga';
const trailDataFile = 'src/data/mountain-bike-trails.data.ts';

const routeProfiles = [
  {
    id: 'riverwalk-loop-v3-public',
    name: 'Riverwalk Loop',
    slug: 'riverwalk-loop',
  },
  {
    id: 'zoo-loop-v2-full-public',
    name: 'Zoo Loop',
    slug: 'zoo-loop',
  },
  {
    id: 'Riverwalk_trail-test-public',
    name: 'Riverwalk Greenway Trail',
    slug: 'riverwalk-greenway-trail',
  },
  {
    id: 'South_Chick_GreenWay-public',
    name: 'South Chickamauga Creek',
    slug: 'south-chickamauga-creek',
  },
  {
    id: 'cherokeeloop',
    name: 'Cherokee Loop',
    slug: 'cherokee-loop',
  },
  {
    id: 'Moccasin Bend Route',
    name: 'Moccasin Bend Route',
    slug: 'moccasin-bend-route',
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[/&]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function stringProperty(object, propertyName) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (property.name.getText() !== propertyName) continue;
    if (!ts.isStringLiteral(property.initializer)) {
      throw new Error(`${propertyName} must be a string literal`);
    }
    return property.initializer.text;
  }
  return undefined;
}

async function trailProfiles() {
  const sourceText = await readFile(trailDataFile, 'utf8');
  const sourceFile = ts.createSourceFile(
    trailDataFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let trailArray;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText() === 'mountainBikeTrails' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      trailArray = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (!trailArray)
    throw new Error(`mountainBikeTrails not found in ${trailDataFile}`);

  return trailArray.elements.map((element) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error(
        'Every mountainBikeTrails entry must be an object literal',
      );
    }
    const name = stringProperty(element, 'trailName');
    if (!name)
      throw new Error('Every mountainBikeTrails entry needs trailName');
    return { name, slug: stringProperty(element, 'slug') ?? slugify(name) };
  });
}

async function featureFromProfile({ name, slug, ...properties }) {
  const profilePath = path.join(elevationDir, `${slug}.json`);
  const profile = JSON.parse(await readFile(profilePath, 'utf8'));
  const coordinates = profile.profile.map(([, , lng, lat]) => [lng, lat]);
  if (coordinates.length < 2) {
    throw new Error(`${profilePath} has fewer than two coordinates`);
  }
  return {
    type: 'Feature',
    properties: { ...properties, name, slug },
    geometry: { type: 'LineString', coordinates },
  };
}

async function main() {
  const routes = await Promise.all(
    routeProfiles.map((profile) => featureFromProfile(profile)),
  );
  const trails = await Promise.all(
    (await trailProfiles()).map(async (profile) => {
      const feature = await featureFromProfile(profile);
      feature.properties.Trail = feature.properties.name;
      return feature;
    }),
  );

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, 'routes.geojson'),
    `${JSON.stringify({ type: 'FeatureCollection', features: routes })}\n`,
  );
  await writeFile(
    path.join(outputDir, 'trails.geojson'),
    `${JSON.stringify({ type: 'FeatureCollection', features: trails })}\n`,
  );
  console.log(`Wrote ${routes.length} routes and ${trails.length} trails`);
}

await main();
