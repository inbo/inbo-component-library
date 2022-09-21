// ngOnInit(): void {
//   this.displayedColumns = Object.keys(this.columnConfiguration) as Array<keyof T & string>;
// }

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
          sortable: false,
        },
        propA: {
          name: 'Property A',
          sortable: true,
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
