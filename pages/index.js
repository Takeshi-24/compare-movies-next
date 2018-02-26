import 'isomorphic-fetch';
import '~/styles/index.scss';

import React, { Component } from 'react';
import withRedux from 'next-redux-wrapper';
import Helmet from 'react-helmet';
import initStore from '~/store';
import Layout from '~/components/Layout';
import Metas from '~/components/Metas';
import PageLoader from '~/components/PageLoader';
import Suggests from '~/components/Suggests';
import { getSuggestedMovies } from '~/actions/SuggestsActions';
import { addMovie, removeAllMovies } from '~/actions/MovieActions';

class IndexPage extends Component {
  static async getInitialProps({ req, store }) {
    if (req) {
      Helmet.renderStatic();
      await store.dispatch(getSuggestedMovies());
    } else {
      store.dispatch(removeAllMovies());
    }

    const suggests = store.getState().getIn(['suggests', 'results']);
    return {
      suggests: suggests ? suggests.toJS() : null
    };
  }

  render() {
    const {
      showPageLoader,
      suggests,
      getSuggestedMovies,
      onMovieSelect
    } = this.props;

    return (
      <Layout>
        <Suggests
          suggests={suggests}
          getSuggestedMovies={getSuggestedMovies}
          onMovieSelect={onMovieSelect}
        />
        <Metas />
        {showPageLoader && <PageLoader />}
      </Layout>
    );
  }
}

const mapStateToProps = state => {
  const suggests = state.getIn(['suggests', 'results']);
  return {
    showPageLoader:
      state.getIn(['suggests', 'fetching']) ||
      state.getIn(['movies', 'fetching']),
    suggests: suggests ? suggests.toJS() : null
  };
};

const mapDispatchToProps = dispatch => ({
  getSuggestedMovies: () => dispatch(getSuggestedMovies()),
  onMovieSelect: movie => dispatch(addMovie(movie))
});

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(
  IndexPage
);
