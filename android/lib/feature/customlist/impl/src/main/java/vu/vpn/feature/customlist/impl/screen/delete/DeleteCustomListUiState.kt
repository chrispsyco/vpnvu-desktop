package vu.vpn.feature.customlist.impl.screen.delete

import vu.vpn.lib.model.CustomListName
import vu.vpn.lib.usecase.customlists.DeleteWithUndoError

data class DeleteCustomListUiState(val name: CustomListName, val deleteError: DeleteWithUndoError?)
