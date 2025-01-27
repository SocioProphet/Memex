import * as React from 'react'
import cx from 'classnames'
import { TooltipBox } from '@worldbrain/memex-common/lib/common-ui/components/tooltip-box'
import CloseButton from './close-button'
import SearchBox from './search-box'

const styles = require('./topbar.css')

interface Props {
    env: 'inpage' | 'overview'
    searchValue: string
    showClearFiltersBtn: boolean
    handleSearchChange: (searchQuery: string) => void
    handleSearchEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void
    handleClearBtn: (e: React.MouseEvent<HTMLButtonElement>) => void
    handleFilterBtnClick: () => void
    disableAddCommentBtn: boolean
    handleCloseBtnClick: () => void
    handleSettingsBtnClick: () => void
    handleAddCommentBtnClick: () => void
    handleClearFiltersBtnClick: React.MouseEventHandler<HTMLSpanElement>
}

/* tslint:disable-next-line variable-name */
const Topbar = ({
    disableAddCommentBtn,
    handleCloseBtnClick,
    handleSettingsBtnClick,
    handleAddCommentBtnClick,
    ...props
}: Props) => (
    <div className={styles.topbar}>
        {props.env === 'overview' && (
            <TooltipBox tooltipText="Close (ESC)" placement="right">
                <CloseButton
                    title="Close sidebar once. Disable via Memex icon in the extension toolbar."
                    clickHandler={(e) => {
                        e.stopPropagation()
                        handleCloseBtnClick()
                    }}
                />
            </TooltipBox>
        )}
        {props.env === 'inpage' && (
            <React.Fragment>
                <SearchBox
                    placeholder={'Search Memex'}
                    searchValue={props.searchValue}
                    onSearchChange={props.handleSearchChange}
                    onSearchEnter={props.handleSearchEnter}
                    onClearBtn={props.handleClearBtn}
                />
                <button
                    onClick={props.handleFilterBtnClick}
                    className={cx(styles.filterButton, {
                        [styles.filterButtonActive]: props.showClearFiltersBtn,
                    })}
                >
                    Filters
                    {props.showClearFiltersBtn && (
                        <TooltipBox
                            placement="bottom"
                            tooltipText={'Clear filters'}
                        >
                            <span
                                className={styles.clearFilters}
                                onClick={props.handleClearFiltersBtnClick}
                            />
                        </TooltipBox>
                    )}
                </button>
            </React.Fragment>
        )}
        {props.env === 'overview' && (
            <div className={styles.right}>
                {/* Button to add a comment. */}
                <TooltipBox tooltipText="Add notes to page" placement="left">
                    <button
                        className={cx(styles.button, styles.comments, {
                            [styles.disabled]: disableAddCommentBtn,
                        })}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleAddCommentBtnClick()
                        }}
                    />
                </TooltipBox>
            </div>
        )}
    </div>
)

export default Topbar
