import {InboDataTableComponent} from '../inbo-data-table.component';

describe('InboDataTableComponent', () => {

  let componentUnderTest: InboDataTableComponent<TestDataClass>;

  beforeEach(() => {
    componentUnderTest = new InboDataTableComponent();
  });

  describe('ngOnInit', () => {

    it('should set the displayedColumns from the given column configuration', () => {
      componentUnderTest.columnConfiguration = {
        id: {
          name: 'Id',
        },
        propA: {
          name: 'Property A',
        },
      };

      componentUnderTest.ngOnInit();

      expect(componentUnderTest.displayedColumns).toEqual(['id', 'propA']);
    });
  });

});

interface TestDataClass {
  id: string;
  propA: string;
  propB: number;
}
