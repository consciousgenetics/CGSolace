import React from 'react'

import {
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsList,
  BreadcrumbsSeparator,
  BreadcrumbsStatic,
} from '@modules/common/components/breadcrumbs'
import { ArrowLeftIcon } from '@modules/common/icons'

export default function StoreBreadcrumbs({
  breadcrumb,
}: {
  breadcrumb?: string
}) {
  return (
    <>
      <Breadcrumbs className="text-basic-primary py-3 sm:py-4 mt-2 sm:mt-0">
        <BreadcrumbsList className="hidden small:flex">
          <BreadcrumbsItem>
            <BreadcrumbsLink href="/">Homepage</BreadcrumbsLink>
          </BreadcrumbsItem>
          <BreadcrumbsSeparator />
          <BreadcrumbsItem>
            <BreadcrumbsStatic>{breadcrumb ?? 'Shop'}</BreadcrumbsStatic>
          </BreadcrumbsItem>
        </BreadcrumbsList>
        <BreadcrumbsList className="flex small:hidden py-2">
          <BreadcrumbsItem>
            <BreadcrumbsLink
              href="/"
              className="flex items-center gap-2 text-md py-1"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
              Back to Homepage
            </BreadcrumbsLink>
          </BreadcrumbsItem>
        </BreadcrumbsList>
      </Breadcrumbs>
    </>
  )
}
