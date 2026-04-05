import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

function makePartial(input: string) {
  return `${getConfig().typeboxImportVariableName}.Partial(${input})`;
}

export function makeComposite(inputModels: string[], partial: boolean[] = []) {
  const { exportedTypePrefix, typeboxImportVariableName } = getConfig();

  return `${typeboxImportVariableName}.Composite([${inputModels
    .map((model, i) => {
      let modelStr = `${exportedTypePrefix}${model}`;
      if (partial[i]) modelStr = makePartial(modelStr);

      return modelStr;
    })
    .join(", ")}], ${generateTypeboxOptions()})\n`;
}
