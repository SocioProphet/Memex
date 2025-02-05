import GenericPickerLogic, { GenericPickerState } from './logic'
import {
    makeSingleDeviceUILogicTestFactory,
    UILogicTestDevice,
} from 'src/tests/ui-logic-tests'
import 'jest-extended'
import { PickerUpdateHandler } from './types'

// see https://github.com/WorldBrain/Memex-Mobile/blob/develop/app/src/features/overview/ui/screens/dashboard/logic.test.ts
// see https://github.com/WorldBrain/Memex-Mobile/blob/7b74b83d3f3ebec793317c84222939d3fcba67b7/app/src/ui/index.tests.ts#L3

class TestPickerLogic extends GenericPickerLogic {
    pickerName = 'Test'

    validateEntry = this._validateEntry
}

const TESTURL = 'http://test.com'

const stateHelper = ({
    entryResultEntrySelected,
    entryResultEntryNotSelected,
    entryResultEntryFocused,
    selectedEntries,
    query,
    newEntryButton,
}: {
    entryResultEntrySelected?: string[]
    entryResultEntryNotSelected?: string[]
    entryResultEntryFocused?: string[]
    selectedEntries?: string[]
    query?: string
    newEntryButton?: boolean
}) => ({
    displayEntries: [
        ...(entryResultEntryFocused ?? []).map((t) => ({
            name: t,
            focused: true,
            selected: false,
        })),
        ...(entryResultEntryNotSelected ?? [])
            .filter((t) => !(entryResultEntryFocused ?? []).includes(t))
            .map((t) => ({
                name: t,
                focused: false,
                selected: false,
            })),
        ...(entryResultEntrySelected ?? [])
            .filter((t) => !(entryResultEntryFocused ?? []).includes(t))
            .map((t) => ({
                name: t,
                focused: false,
                selected: true,
            })),
    ],
    selectedEntries: selectedEntries ?? [],
    loadingQueryResults: false,
    loadingSuggestions: false,
    query: query ?? '',
    newEntryName: newEntryButton ? query : '',
})

const setupLogicHelper = async ({
    device,
    onUpdateEntrySelection,
    queryEntries,
    queryEntryResults,
    initialSuggestions,
    initialSelectedEntries,
    url,
}: {
    device: UILogicTestDevice
    onUpdateEntrySelection?: PickerUpdateHandler
    queryEntries?: (query: string) => Promise<string[]>
    queryEntryResults?: string[]
    initialSuggestions?: string[]
    initialSelectedEntries?: string[]
    url?: string
}) => {
    const backendEntryUpdate: PickerUpdateHandler = async ({
        added,
        deleted,
    }) =>
        device.backgroundModules.tags.updateTagForPage({
            added,
            deleted,
            url: url ?? TESTURL,
        })

    if (!queryEntries) {
        queryEntries = queryEntryResults
            ? async (query: string) => queryEntryResults
            : async (query: string) => []
    }

    const entryPickerLogic = new TestPickerLogic({
        queryEntries,
        onUpdateEntrySelection: onUpdateEntrySelection ?? backendEntryUpdate,
        loadDefaultSuggestions: () => initialSuggestions ?? [],
        initialSelectedEntries: async () => initialSelectedEntries ?? [],
        actOnAllTabs: async (entry) => null,
    })

    const testLogic = device.createElement(entryPickerLogic)
    await testLogic.init()
    return { testLogic, entryPickerLogic }
}

const expectStateToEqual = (
    resultState: GenericPickerState,
    expectedState: GenericPickerState,
) => {
    const { displayEntries: queryEntriesResult, ...restResult } = resultState
    const {
        displayEntries: queryEntriesExpected,
        ...restExpected
    } = expectedState
    expect(restResult).toEqual(restExpected)
    // Compares the array state without caring about order
    expect(queryEntriesResult).toIncludeSameMembers(queryEntriesExpected)
}

describe('GenericPickerLogic', () => {
    const it = makeSingleDeviceUILogicTestFactory({
        includePostSyncProcessor: true,
    })

    it('should correctly load initial entries', async ({ device }) => {
        const initialSuggestions = ['sugg1', 'sugg2']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
        })

        expect(testLogic.state).toEqual(
            stateHelper({ entryResultEntryNotSelected: initialSuggestions }),
        )
    })

    it('should correctly load initial entries and set those selected when selected are in initial entries', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2', 'test1']
        const initialSelectedEntries = ['test1']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
        })

        expectStateToEqual(
            testLogic.state,
            stateHelper({
                entryResultEntryNotSelected: ['sugg1', 'sugg2'],
                entryResultEntrySelected: initialSelectedEntries,
                selectedEntries: initialSelectedEntries,
            }),
        )
    })
    it('should correctly load initial entries and set those selected when selected are not in initial entries', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['test1']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
        })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: ['sugg1', 'sugg2'],
                selectedEntries: initialSelectedEntries,
            }),
        )
    })

    it('should correctly search for a entry when entry is already selected', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['test1']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntryResults: ['test1'],
        })
        await testLogic.processEvent('searchInputChanged', { query: 'test' })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntrySelected: ['test1'],
                selectedEntries: initialSelectedEntries,
                query: 'test',
                newEntryButton: true,
            }),
        )
    })

    it('should correctly search for a entry when entry is not selected', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['something']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntryResults: ['test1'],
        })
        await testLogic.processEvent('searchInputChanged', { query: 'test' })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: ['test1'],
                selectedEntries: initialSelectedEntries,
                query: 'test',
                newEntryButton: true,
            }),
        )
    })

    it('should correctly search for a entry regardless of case', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['something']
        let lastQuery: string

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntries: async (query: string) => {
                lastQuery = query
                return ['test1']
            },
        })
        expect(lastQuery).toEqual(undefined)
        await testLogic.processEvent('searchInputChanged', { query: 'Test' })
        expect(lastQuery).toEqual('test')

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: ['test1'],
                selectedEntries: initialSelectedEntries,
                query: 'Test',
                newEntryButton: true,
            }),
        )
    })

    it('should correctly navigate the search results by up and down arrows', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['something']
        const queryEntryResults = ['test1', 'test2', 'test3', 'test4']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntryResults,
        })
        await testLogic.processEvent('searchInputChanged', { query: 'test' })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: queryEntryResults,
                selectedEntries: initialSelectedEntries,
                query: 'test',
                newEntryButton: true,
            }),
        )

        const expectStateToEqualWithFocus = (focusedEntry) =>
            expectStateToEqual(
                testLogic.state,
                stateHelper({
                    entryResultEntryNotSelected: queryEntryResults,
                    selectedEntries: initialSelectedEntries,
                    entryResultEntryFocused: focusedEntry ? [focusedEntry] : [],
                    query: 'test',
                    newEntryButton: true,
                }),
            )

        const keyPressAndExpectFocus = async (sequence) => {
            for (const seq of sequence) {
                await testLogic.processEvent('keyPress', { key: seq[0] })
                expectStateToEqualWithFocus(seq[1])
            }
        }

        await keyPressAndExpectFocus([
            ['ArrowDown', 'test1'],
            ['ArrowDown', 'test2'],
            ['ArrowDown', 'test3'],
            ['ArrowDown', 'test4'],
            ['ArrowDown', 'test4'],
            ['ArrowDown', 'test4'],
            ['ArrowDown', 'test4'],
            ['ArrowUp', 'test3'],
            ['ArrowUp', 'test2'],
            ['ArrowUp', 'test1'],
            // This is navigating beyond the initial result, which is the 'New Entry: ... ' button, so no entry will be selected
            ['ArrowUp'],
            ['ArrowUp'],
            ['ArrowUp'],
            ['ArrowDown', 'test1'],
        ])
    })

    it('should correctly remove search', async ({ device }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['something']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntryResults: ['test1'],
        })
        await testLogic.processEvent('searchInputChanged', { query: 'test' })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: ['test1'],
                selectedEntries: initialSelectedEntries,
                query: 'test',
                newEntryButton: true,
            }),
        )

        await testLogic.processEvent('searchInputChanged', { query: '' })

        expect(testLogic.state).toEqual(
            stateHelper({
                entryResultEntryNotSelected: initialSuggestions,
                selectedEntries: initialSelectedEntries,
                query: '',
                newEntryButton: false,
            }),
        )
    })

    it('should show default entries after selecting a entry', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const initialSelectedEntries = ['something']

        const { testLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
            initialSelectedEntries,
            queryEntryResults: ['test1'],
        })
        await testLogic.processEvent('searchInputChanged', { query: 'test' })

        // expect(element.state).toEqual(
        //     stateHelper({
        //         selectedEntries: ['test1'],
        //         query: 'test',
        //         newEntryButton: true,
        //     }),
        // )
        //
        // await element.processEvent('searchInputChanged', { query: '' })
        //
        // expect(element.state).toEqual(
        //     stateHelper({
        //         entryResultEntryNotSelected: [],
        //         selectedEntries: [],
        //         query: '',
        //         newEntryButton: false,
        //     }),
        // )
    })

    it('should correctly validate entries', async ({ device }) => {
        const { testLogic, entryPickerLogic } = await setupLogicHelper({
            device,
        })

        expect(() => entryPickerLogic.validateEntry('test')).not.toThrowError()
        expect(() =>
            entryPickerLogic.validateEntry('test test'),
        ).not.toThrowError()
        expect(() =>
            entryPickerLogic.validateEntry('test test $test %'),
        ).not.toThrowError()
        expect(() =>
            entryPickerLogic.validateEntry('test test $test %🤣😁 😅😁'),
        ).not.toThrowError()
        expect(() => entryPickerLogic.validateEntry('   ')).toThrowError(
            `Test Validation: Can't add entry with only whitespace`,
        )
    })

    it('should correctly add entry ', async ({ device }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const { testLogic, entryPickerLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
        })

        const entriesBefore = await device.backgroundModules.tags.fetchPageTags(
            {
                url: TESTURL,
            },
        )
        await testLogic.processEvent('resultEntryPress', {
            entry: { name: 'sugg1', focused: false, selected: false },
        })
        await entryPickerLogic.processingUpstreamOperation

        const entriesAfter = await device.backgroundModules.tags.fetchPageTags({
            url: TESTURL,
        })

        expect(entriesBefore).toEqual([])
        expect(entriesAfter).toEqual(['sugg1'])
    })

    it('should correctly add entry to all tabs', async ({ device }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const { testLogic, entryPickerLogic } = await setupLogicHelper({
            device,
            initialSuggestions,
        })

        const { tags } = device.backgroundModules

        expect(await tags.fetchPageTags({ url: TESTURL })).toEqual([])
        expect(testLogic.state.selectedEntries).toEqual([])

        await testLogic.processEvent('resultEntryAllPress', {
            entry: { name: 'sugg1', focused: false, selected: false },
        })
        await entryPickerLogic.processingUpstreamOperation

        expect(await tags.fetchPageTags({ url: TESTURL })).toEqual(['sugg1'])
        expect(testLogic.state.selectedEntries).toEqual(['sugg1'])
    })

    it('should correctly add a new entry to all tabs', async ({ device }) => {
        const { testLogic, entryPickerLogic } = await setupLogicHelper({
            device,
        })

        const { tags } = device.backgroundModules

        expect(await tags.fetchPageTags({ url: TESTURL })).toEqual([])
        expect(testLogic.state.selectedEntries).toEqual([])

        await testLogic.processEvent('newEntryAllPress', {
            entry: 'sugg1',
        })
        await entryPickerLogic.processingUpstreamOperation

        expect(await tags.fetchPageTags({ url: TESTURL })).toEqual(['sugg1'])
        expect(testLogic.state.selectedEntries).toEqual(['sugg1'])
    })

    it('should be in the right state after an error adding a entry', async ({
        device,
    }) => {
        const initialSuggestions = ['sugg1', 'sugg2']
        const testError = Error('test error')
        const onUpdateEntrySelection = async () => {
            throw testError
        }
        const { testLogic, entryPickerLogic } = await setupLogicHelper({
            onUpdateEntrySelection,
            device,
            initialSuggestions,
        })

        const entriesBefore = await device.backgroundModules.tags.fetchPageTags(
            {
                url: TESTURL,
            },
        )

        await expect(
            testLogic.processEvent('resultEntryPress', {
                entry: { name: 'sugg1', focused: false, selected: false },
            }),
        ).rejects.toEqual(testError)

        const entriesAfter = await device.backgroundModules.tags.fetchPageTags({
            url: TESTURL,
        })

        expect(entriesBefore).toEqual([])
        expect(entriesAfter).toEqual([])
    })
})
