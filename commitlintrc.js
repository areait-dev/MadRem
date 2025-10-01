module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',     // nuova feature
          'fix',      // bug fix
          'docs',     // documentazione
          'style',    // formatting
          'refactor', // refactoring
          'test',     // test
          'chore',    // maintenance
          'config',   // configurazione
        ],
      ],
    },
  };