/* INCLUDE: "common.jsx" */
const nearDevGovGigsContractAccountId =
  props.nearDevGovGigsContractAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

const nearDevGovGigsWidgetsAccountId =
  props.nearDevGovGigsWidgetsAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

function widget(widgetName, widgetProps, key) {
  widgetProps = {
    ...widgetProps,
    nearDevGovGigsContractAccountId: props.nearDevGovGigsContractAccountId,
    nearDevGovGigsWidgetsAccountId: props.nearDevGovGigsWidgetsAccountId,
    referral: props.referral,
  };

  return (
    <Widget
      src={`${nearDevGovGigsWidgetsAccountId}/widget/gigs-board.${widgetName}`}
      props={widgetProps}
      key={key}
    />
  );
}

function href(widgetName, linkProps) {
  linkProps = { ...linkProps };

  if (props.nearDevGovGigsContractAccountId) {
    linkProps.nearDevGovGigsContractAccountId =
      props.nearDevGovGigsContractAccountId;
  }

  if (props.nearDevGovGigsWidgetsAccountId) {
    linkProps.nearDevGovGigsWidgetsAccountId =
      props.nearDevGovGigsWidgetsAccountId;
  }

  if (props.referral) {
    linkProps.referral = props.referral;
  }

  const linkPropsQuery = Object.entries(linkProps)
    .filter(([_key, nullable]) => (nullable ?? null) !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `/#/${nearDevGovGigsWidgetsAccountId}/widget/gigs-board.pages.${widgetName}${
    linkPropsQuery ? "?" : ""
  }${linkPropsQuery}`;
}
/* END_INCLUDE: "common.jsx" */
/* INCLUDE: "core/adapter/dev-hub" */
const devHubAccountId =
  props.nearDevGovGigsContractAccountId ||
  (context.widgetSrc ?? "devgovgigs.near").split("/", 1)[0];

const DevHub = {
  edit_community_github: ({ handle, github }) =>
    Near.call(devHubAccountId, "edit_community_github", { handle, github }) ??
    null,

  get_access_control_info: () =>
    Near.view(devHubAccountId, "get_access_control_info") ?? null,

  get_all_authors: () => Near.view(devHubAccountId, "get_all_authors") ?? null,

  get_all_communities: () =>
    Near.view(devHubAccountId, "get_all_communities") ?? null,

  get_all_labels: () => Near.view(devHubAccountId, "get_all_labels") ?? null,

  get_community: ({ handle }) =>
    Near.view(devHubAccountId, "get_community", { handle }) ?? null,

  get_post: ({ post_id }) =>
    Near.view(devHubAccountId, "get_post", { post_id }) ?? null,

  get_posts_by_author: ({ author }) =>
    Near.view(devHubAccountId, "get_posts_by_author", { author }) ?? null,

  get_posts_by_label: ({ label }) =>
    Near.view(nearDevGovGigsContractAccountId, "get_posts_by_label", {
      label,
    }) ?? null,

  get_root_members: () =>
    Near.view(devHubAccountId, "get_root_members") ?? null,

  useQuery: ({ name, params }) => {
    const initialState = { data: null, error: null, isLoading: true };

    const cacheState = useCache(
      () =>
        Near.asyncView(devHubAccountId, ["get", name].join("_"), params ?? {})
          .then((response) => ({
            ...initialState,
            data: response ?? null,
            isLoading: false,
          }))
          .catch((error) => ({
            ...initialState,
            error: props?.error ?? error,
            isLoading: false,
          })),

      JSON.stringify({ name, params }),
      { subscribe: true }
    );

    return cacheState === null
      ? { ...cacheState, ...initialState }
      : cacheState;
  },
};
/* END_INCLUDE: "core/adapter/dev-hub" */

const Gradient = styled.div`
   {
    height: 250px;
    text-align: center;
    background: radial-gradient(
      circle,
      rgba(29, 55, 57, 1) 30%,
      rgba(24, 24, 24, 1) 80%
    );

    font-family: Arial, sans-serif;
  }

  .text-primary-gradient {
    color: #53fdca;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(#8e76ba, #1ed2f0);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .subtitle-above {
    font-size: 18px;
    letter-spacing: 1px;
    font-family: Courier, monospace;
  }

  .subtitle-below {
    font-size: 16px;
  }

  .slogan {
    font-weight: 600;
    font-size: 60px;
  }
`;

const header = (
  <div className="d-flex flex-column">
    <Gradient className="d-flex flex-column justify-content-center">
      <div className="subtitle-above text-white opacity-75 mb-2">
        A decentralized community of
      </div>

      <h1 className="mb-3 text-white slogan">
        <span className="text-primary-gradient">NEAR </span>Developers
      </h1>

      <div className="subtitle-below text-white opacity-75">
        Share your ideas, match solutions, and access support and funding.
      </div>
    </Gradient>

    <div className="d-flex flex-column gap-4 py-4">
      <div className="d-flex justify-content-between">
        <h5 className="h5 m-0">Featured Communities</h5>
      </div>

      <div className="d-flex gap-4 justify-content-between">
        {(DevHub.get_all_communities() ?? [])
          .filter(({ handle }) =>
            [
              "zero-knowledge",
              "protocol",
              "contract-standards",
              "education",
            ].includes(handle)
          )
          .map((community) =>
            widget(
              "entity.community.card",
              { ...community, format: "medium" },
              community.handle
            )
          )}
      </div>
    </div>

    <div className="h5 pb-4">Activity</div>
  </div>
);

const FeedPage = ({ author, recency, tag }) => {
  State.init({
    initial: { author, tag },
    author,
    tag,
  });

  // When rerendered with different props, State will be preserved, so we need to update the state when we detect that the props have changed.
  if (tag !== state.initial.tag || author !== state.initial.author) {
    State.update((lastKnownState) => ({
      ...lastKnownState,
      initial: { author, tag },
      author,
      tag,
    }));
  }

  const onTagSearch = (tag) => {
    State.update((lastKnownState) => ({ ...lastKnownState, tag }));
  };

  const onAuthorSearch = (author) => {
    State.update((lastKnownState) => ({ ...lastKnownState, author }));
  };

  return widget("components.layout.Page", {
    header,

    children: widget("feature.post-search.panel", {
      author: state.author,
      authorQuery: { author: state.author },
      children: widget("components.layout.Controls"),
      onAuthorSearch,
      onTagSearch,
      recency,
      tag: state.tag,
      tagQuery: { tag: state.tag },
      transactionHashes: props.transactionHashes,
    }),
  });
};

return FeedPage(props);
