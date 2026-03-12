import { describe, it, expect } from 'vitest';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
    describe('default state', () => {
        it('starts at page 1 with perPage 10 and total 0', () => {
            const { currentPage, perPage, totalItems } = usePagination();
            expect(currentPage.value).toBe(1);
            expect(perPage.value).toBe(10);
            expect(totalItems.value).toBe(0);
        });
    });

    describe('totalPages', () => {
        it('computes correctly for 50 items with 10 per page', () => {
            const { totalPages } = usePagination({ total: 50, initialPerPage: 10 });
            expect(totalPages.value).toBe(5);
        });

        it('rounds up for partial pages', () => {
            const { totalPages } = usePagination({ total: 51, initialPerPage: 10 });
            expect(totalPages.value).toBe(6);
        });
    });

    describe('goToPage', () => {
        it('changes the current page', () => {
            const { currentPage, goToPage } = usePagination({ total: 50 });
            goToPage(3);
            expect(currentPage.value).toBe(3);
        });

        it('ignores page below 1', () => {
            const { currentPage, goToPage } = usePagination({ total: 50 });
            goToPage(0);
            expect(currentPage.value).toBe(1);
        });

        it('ignores page above totalPages', () => {
            const { currentPage, goToPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(10);
            expect(currentPage.value).toBe(1);
        });
    });

    describe('nextPage / previousPage', () => {
        it('nextPage increments the page', () => {
            const { currentPage, nextPage } = usePagination({ total: 50 });
            nextPage();
            expect(currentPage.value).toBe(2);
        });

        it('previousPage decrements the page', () => {
            const { currentPage, goToPage, previousPage } = usePagination({ total: 50 });
            goToPage(3);
            previousPage();
            expect(currentPage.value).toBe(2);
        });

        it('nextPage does not go past last page', () => {
            const { currentPage, goToPage, nextPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(5);
            nextPage();
            expect(currentPage.value).toBe(5);
        });

        it('previousPage does not go below page 1', () => {
            const { currentPage, previousPage } = usePagination({ total: 50 });
            previousPage();
            expect(currentPage.value).toBe(1);
        });
    });

    describe('hasNextPage / hasPreviousPage', () => {
        it('hasNextPage is true on first page with multiple pages', () => {
            const { hasNextPage } = usePagination({ total: 50 });
            expect(hasNextPage.value).toBe(true);
        });

        it('hasPreviousPage is false on first page', () => {
            const { hasPreviousPage } = usePagination({ total: 50 });
            expect(hasPreviousPage.value).toBe(false);
        });

        it('hasPreviousPage is true on page 2', () => {
            const { hasPreviousPage, goToPage } = usePagination({ total: 50 });
            goToPage(2);
            expect(hasPreviousPage.value).toBe(true);
        });

        it('hasNextPage is false on last page', () => {
            const { hasNextPage, goToPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(5);
            expect(hasNextPage.value).toBe(false);
        });
    });

    describe('offset', () => {
        it('is 0 on page 1', () => {
            const { offset } = usePagination({ total: 50 });
            expect(offset.value).toBe(0);
        });

        it('is 10 on page 2 with perPage 10', () => {
            const { offset, goToPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(2);
            expect(offset.value).toBe(10);
        });
    });

    describe('startItem / endItem', () => {
        it('startItem is 1 and endItem is 10 on page 1', () => {
            const { startItem, endItem } = usePagination({ total: 50, initialPerPage: 10 });
            expect(startItem.value).toBe(1);
            expect(endItem.value).toBe(10);
        });

        it('startItem is 11 and endItem is 20 on page 2', () => {
            const { startItem, endItem, goToPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(2);
            expect(startItem.value).toBe(11);
            expect(endItem.value).toBe(20);
        });

        it('endItem does not exceed total', () => {
            const { endItem, goToPage } = usePagination({ total: 25, initialPerPage: 10 });
            goToPage(3);
            expect(endItem.value).toBe(25);
        });

        it('startItem is 0 when total is 0', () => {
            const { startItem } = usePagination({ total: 0 });
            expect(startItem.value).toBe(0);
        });
    });

    describe('setPerPage', () => {
        it('resets to page 1 when changing perPage', () => {
            const { currentPage, goToPage, setPerPage } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(3);
            setPerPage(20);
            expect(currentPage.value).toBe(1);
        });
    });

    describe('setTotal', () => {
        it('adjusts current page if out of bounds', () => {
            const { currentPage, goToPage, setTotal } = usePagination({ total: 50, initialPerPage: 10 });
            goToPage(5);
            setTotal(20);
            expect(currentPage.value).toBe(2);
        });
    });

    describe('paginateArray', () => {
        it('slices array correctly for page 1', () => {
            const { paginateArray } = usePagination({ total: 5, initialPerPage: 2 });
            const result = paginateArray([1, 2, 3, 4, 5]);
            expect(result).toEqual([1, 2]);
        });

        it('slices array correctly for page 2', () => {
            const { paginateArray, goToPage } = usePagination({ total: 5, initialPerPage: 2 });
            goToPage(2);
            const result = paginateArray([1, 2, 3, 4, 5]);
            expect(result).toEqual([3, 4]);
        });
    });

    describe('reset', () => {
        it('restores initial state', () => {
            const { currentPage, perPage, totalItems, goToPage, setPerPage, setTotal, reset } =
                usePagination({ initialPage: 1, initialPerPage: 10, total: 50 });
            goToPage(3);
            setPerPage(20);
            setTotal(100);
            reset();
            expect(currentPage.value).toBe(1);
            expect(perPage.value).toBe(10);
            expect(totalItems.value).toBe(50);
        });
    });
});
