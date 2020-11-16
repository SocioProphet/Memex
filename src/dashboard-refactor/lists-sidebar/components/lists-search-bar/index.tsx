import React, { PureComponent } from 'react'
import styled, { css } from 'styled-components'

import Margin from 'src/dashboard-refactor/components/Margin'
import { Icon } from 'src/dashboard-refactor/styled-components'

import styles, { fonts } from 'src/dashboard-refactor/styles'
import colors from 'src/dashboard-refactor/colors'

const textStyles = `
    font-family: ${fonts.primary.name};
    font-weight: ${fonts.primary.weight.normal};
    font-size: 10px;
    line-height: 15px;
    color: ${fonts.primary.colors.primary};
    cursor: text;
`

const OuterContainer = styled.div`
    height: min-content
    width: 100%;
    background-color: #fff;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const InnerContainer = styled(Margin)<{ displayTopBorder?: boolean }>`
    height: 24px;
    width: 100%;
    background-color: transparent;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    ${(props) =>
        props.displayTopBorder &&
        css`
            border-top: 0.5px solid ${colors.lighterGrey};
        `}
`

const Input = styled.input<{ isFocused }>`
    ${textStyles}
    width: 100%
    border: none;
    ${(props) => {
        const { primary, secondary } = fonts.primary.colors
        return css`&::placeholder {
            color: ${props.isFocused ? secondary : primary};
            ${textStyles}`
    }}}
    &:focus {
        outline: none;
    }
`

const TextSpan = styled.span<{ bold?: boolean }>`
    ${textStyles}
    ${(props) =>
        props.bold &&
        css`
            font-weight: ${styles.fonts.primary.weight.bold};
        `}
`

const IconContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: start;
`

const StyledIcon = styled(Icon)`
    color: #3a2f45;
`
export interface ListsSidebarSearchBarProps {
    isSearchBarFocused: boolean
    hasPerfectMatch: boolean
    searchQuery?: string
    onListsSidebarSearchBarFocus(): void
    onListsSidebarSearchBarInputChange(): void
}

export default class ListsSidebarSearchBar extends PureComponent<
    ListsSidebarSearchBarProps
> {
    inputRef = React.createRef<HTMLInputElement>()
    componentDidMount = () => {
        if (this.props.isSearchBarFocused) this.inputRef.current.focus()
    }
    renderCreateNew = () => {
        const { searchQuery } = this.props
        return (
            <InnerContainer horizontal="8px" displayTopBorder>
                <Margin right="8px">
                    <TextSpan>Create New:</TextSpan>
                </Margin>
                <TextSpan bold>{searchQuery}</TextSpan>
            </InnerContainer>
        )
    }
    render(): JSX.Element {
        const {
            searchQuery,
            isSearchBarFocused,
            onListsSidebarSearchBarFocus,
            onListsSidebarSearchBarInputChange,
        } = this.props
        return (
            <OuterContainer>
                <InnerContainer
                    onClick={onListsSidebarSearchBarFocus}
                    horizontal="8px"
                >
                    <IconContainer>
                        <Margin right="12px">
                            <StyledIcon
                                heightAndWidth="12px"
                                path="/img/searchIcon.svg"
                            />
                        </Margin>
                    </IconContainer>
                    <Input
                        placeholder="Search or add collection"
                        isFocused={isSearchBarFocused}
                        ref={this.inputRef}
                        onChange={onListsSidebarSearchBarInputChange}
                        value={searchQuery}
                    />
                </InnerContainer>
                {!!this.props.searchQuery &&
                    !this.props.hasPerfectMatch &&
                    this.renderCreateNew()}
            </OuterContainer>
        )
    }
}
