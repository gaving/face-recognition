import React, { Component } from "react";
import extend from "lodash/extend";
import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  SideBar,
  HierarchicalMenuFilter,
  Pagination,
  HitsStats,
  SortingSelector,
  ResetFilters,
  ViewSwitcherHits,
  ViewSwitcherToggle,
  GroupedSelectedFilters,
  Layout,
  TopBar,
  LayoutBody,
  LayoutResults,
  ActionBar,
  ActionBarRow
} from "searchkit";
import "./index.css";

const host = "http://localhost:9200/images";
const searchkit = new SearchkitManager(host);

const ImageHitsGridItem = props => {
  const { bemBlocks, result } = props;
  const source = extend({}, result._source, result.highlight);
  return (
    <div
      className={bemBlocks.item().mix(bemBlocks.container("item"))}
      data-qa="hit"
    >
      <img
        data-qa="poster"
        alt="presentation"
        className={bemBlocks.item("poster")}
        src={`http://localhost:9000/?image=${source.doc.sourceKey}`}
        width="170"
        height="240"
      />
    </div>
  );
};

const ImageHitsListItem = props => {
  const { bemBlocks, result } = props;
  const source = extend({}, result._source, result.highlight);
  return (
    <div
      className={bemBlocks.item().mix(bemBlocks.container("item"))}
      data-qa="hit"
    >
      <div className={bemBlocks.item("poster")}>
        <img
          alt="mugshot"
          data-qa="poster"
          src={`http://localhost:9000/?image=${source.doc.sourceKey}`}
        />
      </div>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <div className="my-logo">Face Detect</div>
            <SearchBox autofocus={true} searchOnChange={true} />
          </TopBar>

          <LayoutBody>
            <SideBar>
              <HierarchicalMenuFilter
                fields={["doc.categories.category.raw"]}
                title="Categories"
                id="categories" />
            </SideBar>


            <LayoutResults>
              <ActionBar>
                <ActionBarRow>
                  <HitsStats
                    translations={{
                      "hitstats.results_found": "{hitCount} results found"
                    }}
                  />
                  <ViewSwitcherToggle />
                  <SortingSelector
                    options={[
                      { label: "Relevance", field: "_score", order: "desc" }
                    ]}
                  />
                </ActionBarRow>

                <ActionBarRow>
                  <GroupedSelectedFilters />
                  <ResetFilters />
                </ActionBarRow>
              </ActionBar>
              <ViewSwitcherHits
                hitsPerPage={12}
                hitComponents={[
                  {
                    key: "grid",
                    title: "Grid",
                    itemComponent: ImageHitsGridItem,
                    defaultOption: true
                  },
                  {
                    key: "list",
                    title: "List",
                    itemComponent: ImageHitsListItem
                  }
                ]}
                scrollTo="body"
              />
              <Pagination showNumbers={true} />
            </LayoutResults>
          </LayoutBody>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
