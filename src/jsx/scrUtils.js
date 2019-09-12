
export const configureLocToMonacoRange = (monaco, parser = 'babylon') => {
  switch (parser) {
    case 'babylon':
    default:
      return loc => {
        return new monaco.Range(loc.start.line
          , loc.start.column + 1
          , loc.end ? loc.end.line : loc.start.line
          , loc.end ? loc.end.column + 1 : loc.start.column + 1,
        );
      };
  }
};
