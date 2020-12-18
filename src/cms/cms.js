import CMS from 'netlify-cms-app'
import uploadcare from 'netlify-cms-media-library-uploadcare'
import cloudinary from 'netlify-cms-media-library-cloudinary'

import InfoPagePreview from './preview-templates/InfoPagePreview'
import BlogPostPreview from './preview-templates/BlogPostPreview'
import IndexPagePreview from './preview-templates/IndexPagePreview'

import {
  Control as collectionSelect,
  Preview as collectionSelectPreview
} from './widgets/CollectionSelect';


CMS.registerMediaLibrary(uploadcare)
CMS.registerMediaLibrary(cloudinary)

CMS.registerPreviewTemplate('index', IndexPagePreview)
CMS.registerPreviewTemplate('info', InfoPagePreview)
CMS.registerPreviewTemplate('blog', BlogPostPreview)

CMS.registerWidget('collectionSelect', collectionSelect, collectionSelectPreview);
