exports.addHATEOASLinks = (resource, req, resourceType) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;

  /**
   * Represents a collection of links related to a specific resource.
   * @property {Object} self - Link to the resource itself.
   * @property {string} self.href - URL of the resource.
   */
  const links = {
    self: {
      href: `${baseUrl}/${resourceType}s/${resource.id}`,
    },
  };

  switch (resourceType) {
    case 'movie':
      links.ratings = {
        href: `${baseUrl}/movies/${resource.id}/ratings`,
      };
      break;
    case 'rating':
      links.movie = {
        href: `${baseUrl}/movies/${resource.movie}`,
      };
      break;
    case 'actor':
      links.movies = {
        href: `${baseUrl}/movies?actor=${resource.id}`,
      };
      break;
  }

  return {
    ...resource,
    links,
  };
};
exports.addHATEOASLinks = (resource, req, resourceType) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
  
  const resourceId = resource._id || resource.id;
  if (!resourceId) {
    throw new Error(`Resource of type ${resourceType} is missing an ID`);
  }

  const links = {
    self: {
      href: `${baseUrl}/${resourceType}s/${resourceId}`,
    },
  };

  switch (resourceType) {
    case 'movie':
      links.ratings = {
        href: `${baseUrl}/movies/${resourceId}/ratings`,
      };
      break;
    case 'rating':
      const movieId = resource.movie?._id || resource.movie;
      if (movieId) {
        links.movie = {
          href: `${baseUrl}/movies/${movieId}`,
        };
      }
      break;
    case 'actor':
      links.movies = {
        href: `${baseUrl}/movies?actor=${resourceId}`,
      };
      break;
  }
  const { _id, id, ...resourceWithoutIds } = resource;
  
  return {
    ...resourceWithoutIds,
    id: resourceId,
    links,
  };
};
