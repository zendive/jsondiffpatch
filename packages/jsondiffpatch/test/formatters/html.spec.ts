import DiffMatchPatch from 'diff-match-patch';
import * as htmlFormatter from '../../src/formatters/html.js';
import * as jsondiffpatch from '../../src/index.js';

const DiffPatcher = jsondiffpatch.DiffPatcher;

describe('formatters.html', () => {
  let instance: jsondiffpatch.DiffPatcher;
  let formatter: typeof htmlFormatter;

  beforeAll(() => {
    instance = new DiffPatcher({
      textDiff: { diffMatchPatch: DiffMatchPatch, minLength: 10 },
    });
    formatter = htmlFormatter;
  });

  const expectFormat = (before: unknown, after: unknown, expected: string) => {
    const diff = instance.diff(before, after);
    const format = formatter.format(diff);
    expect(format).toEqual(expected);
  };

  const expectedHtml = (
    expectedDiff: {
      start: number;
      length: number;
      data: { type: string; text: string }[];
    }[],
  ) => {
    const html: string[] = [];
    expectedDiff.forEach(function (diff) {
      html.push('<li>');
      html.push('<div class="jsondiffpatch-textdiff-location">');
      html.push(
        `<span class="jsondiffpatch-textdiff-line-number">${diff.start}</span>`,
      );
      html.push(
        `<span class="jsondiffpatch-textdiff-char">${diff.length}</span>`,
      );
      html.push('</div>');
      html.push('<div class="jsondiffpatch-textdiff-line">');

      diff.data.forEach(function (data) {
        html.push(
          `<span class="jsondiffpatch-textdiff-${data.type}">${data.text}</span>`,
        );
      });

      html.push('</div>');
      html.push('</li>');
    });
    return (
      '<div class="jsondiffpatch-delta jsondiffpatch-textdiff">' +
      '<div class="jsondiffpatch-value">' +
      '<ul class="jsondiffpatch-textdiff">' +
      `${html.join('')}</ul></div></div>`
    );
  };

  it('should format Chinese', () => {
    const before = '喵星人最可爱最可爱最可爱喵星人最可爱最可爱最可爱';
    const after = '汪星人最可爱最可爱最可爱喵星人meow最可爱最可爱最可爱';
    const expectedDiff = [
      {
        start: 1,
        length: 17,
        data: [
          {
            type: 'deleted',
            text: '喵',
          },
          {
            type: 'added',
            text: '汪',
          },
          {
            type: 'context',
            text: '星人最可爱最可爱最可爱喵星人最可',
          },
        ],
      },
      {
        start: 8,
        length: 16,
        data: [
          {
            type: 'context',
            text: '可爱最可爱喵星人',
          },
          {
            type: 'added',
            text: 'meow',
          },
          {
            type: 'context',
            text: '最可爱最可爱最可',
          },
        ],
      },
    ];
    expectFormat(before, after, expectedHtml(expectedDiff));
  });

  it('should format Japanese', () => {
    const before = '猫が可愛いです猫が可愛いです';
    const after = '猫がmeow可愛いですいぬ可愛いです';
    const expectedDiff = [
      {
        start: 1,
        length: 13,
        data: [
          {
            type: 'context',
            text: '猫が',
          },
          {
            type: 'added',
            text: 'meow',
          },
          {
            type: 'context',
            text: '可愛いです',
          },
          {
            type: 'deleted',
            text: '猫が',
          },
          {
            type: 'added',
            text: 'いぬ',
          },
          {
            type: 'context',
            text: '可愛いで',
          },
        ],
      },
    ];
    expectFormat(before, after, expectedHtml(expectedDiff));
  });
});
