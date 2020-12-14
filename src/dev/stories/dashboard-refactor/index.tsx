import React from 'react'
import { storiesOf } from '@storybook/react'
import { ThemeProvider } from 'styled-components'

import { WithDependencies } from '../../utils'
import {
    DashboardContainer,
    Props as DashboardProps,
} from 'src/dashboard-refactor'
import { theme } from 'src/common-ui/components/design-library/theme'
import * as DATA from 'src/dashboard-refactor/logic.test.data'
import {
    StandardSearchResponse,
    AnnotationsSearchResponse,
} from 'src/search/background/types'
import { insertBackgroundFunctionTab } from 'src/tests/ui-logic-tests'
import { setupBackgroundIntegrationTest } from 'src/tests/background-integration-tests'

// TODO: Try to get this working - currently fails due to `browser.runtime.onMessage.addListener` not being defineddddd
async function createDependencies(): Promise<DashboardProps> {
    const { backgroundModules } = await setupBackgroundIntegrationTest()

    const annotationsBG = insertBackgroundFunctionTab(
        backgroundModules.directLinking.remoteFunctions,
    ) as any

    return {
        annotationsBG,
        listsBG: backgroundModules.customLists.remoteFunctions,
        searchBG: backgroundModules.search.remoteFunctions.search,
        tagsBG: backgroundModules.tags.remoteFunctions,
    }
}

const stories = storiesOf('Dashboard Refactor|Dashboard', module)

stories.add('Page results 1', () => (
    <DashboardWrapper pageResults={DATA.PAGE_SEARCH_RESULT_1} />
))
stories.add('Page results 2', () => (
    <DashboardWrapper pageResults={DATA.PAGE_SEARCH_RESULT_2} />
))
stories.add('Note results 1', () => (
    <DashboardWrapper noteResults={DATA.ANNOT_SEARCH_RESULT_1} />
))
stories.add('Note results 2', () => (
    <DashboardWrapper noteResults={DATA.ANNOT_SEARCH_RESULT_2} />
))

// stories.add('Page results 1', () => (
//     <WithDependencies setup={createDependencies}>
//         {(deps) => (
//             <DashboardWrapper
//                 pageResults={DATA.PAGE_SEARCH_RESULT_1}
//                 {...deps}
//             />
//         )}
//     </WithDependencies>
// ))
// stories.add('Page results 2', () => (
//     <WithDependencies setup={createDependencies}>
//         {(deps) => (
//             <DashboardWrapper
//                 pageResults={DATA.PAGE_SEARCH_RESULT_2}
//                 {...deps}
//             />
//         )}
//     </WithDependencies>
// ))
// stories.add('Note results 1', () => (
//     <WithDependencies setup={createDependencies}>
//         {(deps) => (
//             <DashboardWrapper
//                 noteResults={DATA.ANNOT_SEARCH_RESULT_1}
//                 {...deps}
//             />
//         )}
//     </WithDependencies>
// ))
// stories.add('Note results 2', () => (
//     <WithDependencies setup={createDependencies}>
//         {(deps) => (
//             <DashboardWrapper
//                 noteResults={DATA.ANNOT_SEARCH_RESULT_2}
//                 {...deps}
//             />
//         )}
//     </WithDependencies>
// ))

// interface WrapperProps extends DashboardProps {
interface WrapperProps {
    pageResults?: StandardSearchResponse
    noteResults?: AnnotationsSearchResponse
}

class DashboardWrapper extends React.PureComponent<WrapperProps> {
    private dashboardRef = React.createRef<DashboardContainer>()

    componentDidMount() {
        if (this.props.pageResults) {
            this.dashboardRef.current.processEvent('setPageSearchResult', {
                result: this.props.pageResults,
            })
        } else if (this.props.noteResults) {
            this.dashboardRef.current.processEvent(
                'setAnnotationSearchResult',
                {
                    result: this.props.noteResults,
                },
            )
        }
    }

    render() {
        return (
            <ThemeProvider theme={theme}>
                <DashboardContainer ref={this.dashboardRef} {...this.props} />
            </ThemeProvider>
        )
    }
}
